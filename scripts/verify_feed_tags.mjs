
const BASE_URL = 'http://localhost:3000';

async function verifyFeedTags() {
  try {
    console.log('Fetching approved stories for feed...');
    const response = await fetch(`${BASE_URL}/api/stories?status=approved`);
    const data = await response.json();

    if (!data.stories || data.stories.length === 0) {
      console.log('No approved stories found.');
      return;
    }

    console.log(`Found ${data.stories.length} stories.`);
    const story = data.stories[0];
    console.log('First Story Data:');
    console.log(`- Title: ${story.title}`);
    console.log(`- Tags: ${JSON.stringify(story.tags)}`);

    if (story.tags && Array.isArray(story.tags)) {
      console.log('SUCCESS: Tags are present and are an array.');
    } else {
      console.warn('WARNING: Tags are missing or invalid.');
    }

  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyFeedTags();
