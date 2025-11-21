// ============================================
// SUPABASE EDGE FUNCTION: recurring-post-generator
// ============================================
// Generates scheduled_posts from active recurring_posts rules
//
// Runs daily to ensure upcoming posts are always queued
// Generates posts for the next 14 days from each recurring rule
//
// Deploy with:
// supabase functions deploy recurring-post-generator --no-verify-jwt
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// ============================================
// HELPER: Calculate next post dates
// ============================================
function calculateNextDates(
  frequency: string,
  daysOfWeek: number[] | null,
  daysOfMonth: number[] | null,
  postTime: string,
  startDate: string | null,
  endDate: string | null,
  fromDate: Date,
  daysAhead: number = 14
): Date[] {
  const dates: Date[] = [];
  const [hours, minutes] = postTime.split(':').map(Number);

  let currentDate = new Date(fromDate);
  currentDate.setHours(hours, minutes, 0, 0);

  // Respect start date
  if (startDate) {
    const start = new Date(startDate);
    if (currentDate < start) {
      currentDate = new Date(start);
      currentDate.setHours(hours, minutes, 0, 0);
    }
  }

  const endDateTime = endDate ? new Date(endDate) : null;
  const targetDate = new Date(fromDate);
  targetDate.setDate(targetDate.getDate() + daysAhead);

  let daysChecked = 0;
  const maxDays = daysAhead + 31; // Check a bit further to handle monthly schedules

  while (daysChecked < maxDays && currentDate <= targetDate) {
    let shouldInclude = false;

    if (frequency === 'daily') {
      shouldInclude = true;
    } else if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
      // JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
      // Our DB: 1=Monday, ..., 7=Sunday (ISO format)
      // Convert: JS day 0 -> ISO 7, JS day 1 -> ISO 1
      const jsDay = currentDate.getDay();
      const isoDay = jsDay === 0 ? 7 : jsDay;
      shouldInclude = daysOfWeek.includes(isoDay);
    } else if (frequency === 'monthly' && daysOfMonth && daysOfMonth.length > 0) {
      const dayOfMonth = currentDate.getDate();
      shouldInclude = daysOfMonth.includes(dayOfMonth);
    }

    if (shouldInclude) {
      // Check if within date range
      if (!endDateTime || currentDate <= endDateTime) {
        dates.push(new Date(currentDate));
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
    daysChecked++;
  }

  return dates;
}

// ============================================
// MAIN EDGE FUNCTION
// ============================================
serve(async (req) => {
  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔁 Recurring post generator starting...');

    // Fetch all active recurring posts
    const { data: recurringPosts, error: fetchError } = await supabase
      .from('recurring_posts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching recurring posts:', fetchError);
      throw fetchError;
    }

    if (!recurringPosts || recurringPosts.length === 0) {
      console.log('✓ No active recurring posts found');
      return new Response(
        JSON.stringify({ message: 'No active recurring posts', generated: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${recurringPosts.length} active recurring posts`);

    const results = {
      total: recurringPosts.length,
      generated: 0,
      skipped: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Process each recurring post
    for (const recurringPost of recurringPosts) {
      try {
        console.log(`\n🔁 Processing recurring post: "${recurringPost.title}" (ID: ${recurringPost.id})`);

        // Calculate dates for the next 14 days
        const fromDate = recurringPost.last_generated_at
          ? new Date(recurringPost.last_generated_at)
          : new Date();

        const nextDates = calculateNextDates(
          recurringPost.frequency,
          recurringPost.days_of_week,
          recurringPost.days_of_month,
          recurringPost.post_time,
          recurringPost.start_date,
          recurringPost.end_date,
          fromDate,
          14 // Generate 14 days ahead
        );

        if (nextDates.length === 0) {
          console.log(`  ⏭️  No upcoming dates found (schedule may have ended)`);
          results.skipped++;
          continue;
        }

        console.log(`  📅 Found ${nextDates.length} upcoming dates`);

        // For each date, create scheduled posts for each platform
        let createdCount = 0;

        for (const scheduledDate of nextDates) {
          // Check if posts already exist for this date and recurring rule
          const { data: existingPosts, error: checkError } = await supabase
            .from('scheduled_posts')
            .select('id, platform')
            .eq('recurring_post_id', recurringPost.id)
            .eq('scheduled_at', scheduledDate.toISOString());

          if (checkError) {
            console.error('  ❌ Error checking existing posts:', checkError);
            continue;
          }

          const existingPlatforms = existingPosts?.map(p => p.platform) || [];

          // Create posts for platforms that don't have one yet
          for (const platform of recurringPost.platforms) {
            if (existingPlatforms.includes(platform)) {
              console.log(`  ⏭️  Post already exists for ${platform} at ${scheduledDate.toISOString()}`);
              continue;
            }

            // Create scheduled post
            const { error: insertError } = await supabase
              .from('scheduled_posts')
              .insert({
                user_id: recurringPost.user_id,
                recurring_post_id: recurringPost.id,
                scheduled_at: scheduledDate.toISOString(),
                status: 'scheduled',
                platform: platform,
                content: recurringPost.content,
              });

            if (insertError) {
              console.error(`  ❌ Error creating post for ${platform}:`, insertError);
              results.errors.push({
                recurringPostId: recurringPost.id,
                platform: platform,
                scheduledAt: scheduledDate.toISOString(),
                error: insertError.message,
              });
            } else {
              createdCount++;
              console.log(`  ✅ Created ${platform} post for ${scheduledDate.toISOString()}`);
            }
          }
        }

        // Update last_generated_at timestamp
        await supabase
          .from('recurring_posts')
          .update({
            last_generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', recurringPost.id);

        results.generated += createdCount;
        console.log(`  📊 Created ${createdCount} scheduled posts`);

      } catch (error) {
        results.failed++;
        results.errors.push({
          recurringPostId: recurringPost.id,
          error: error.message,
        });

        console.error(`  ❌ Failed to process recurring post ${recurringPost.id}:`, error);
      }
    }

    console.log('\n📊 Summary:', results);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
