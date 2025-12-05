
const BASE_URL = 'http://localhost:3000';

async function verifyStoryData() {
  try {
    console.log('Fetching stories...');
    const response = await fetch(`${BASE_URL}/api/stories`);
    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      if (!data.stories || data.stories.length === 0) {
        console.log('No stories found.');
        return;
      }
      // ... continue with data ...
      const story = data.stories[0];
      console.log('Story Data:');
      console.log(`- ID: ${story._id}`);
      console.log(`- Title: ${story.title}`);
      console.log(`- Tags: ${JSON.stringify(story.tags)}`);
      console.log(`- Upvotes: ${story.upvotes}`);
      console.log(`- UpvotedBy: ${JSON.stringify(story.upvotedBy)}`);

      if (!story.tags || story.tags.length === 0) {
        console.warn('WARNING: No tags found for this story.');
      } else {
        console.log('SUCCESS: Tags are present.');
      }

      if (typeof story.upvotes !== 'number') {
        console.warn('WARNING: Upvotes field is missing or invalid.');
      } else {
        console.log('SUCCESS: Upvotes field is present.');
      }
    } catch (e) {
      console.error('Failed to parse JSON. Raw response:', text.substring(0, 500)); // Print first 500 chars
    }


  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyStoryData();
