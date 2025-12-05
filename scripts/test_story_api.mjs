// import fetch from 'node-fetch'; // Native fetch is available in Node.js 18+

async function test() {
  try {
    // 1. Fetch all stories to get an ID
    console.log('Fetching all stories...');
    const response = await fetch('http://localhost:3000/api/stories');
    const data = await response.json();
    
    if (data.stories && data.stories.length > 0) {
      const storyId = data.stories[0]._id;
      console.log(`Found story ID: ${storyId}`);
      
      // 2. Fetch single story
      console.log(`Testing single story API for ID: ${storyId}...`);
      const singleStoryResponse = await fetch(`http://localhost:3000/api/stories/${storyId}`);
      const singleStoryData = await singleStoryResponse.json();
      
      if (singleStoryData.story) {
        console.log('SUCCESS: Single story fetched successfully.');
        console.log('Title:', singleStoryData.story.title);
      } else {
        console.error('FAILURE: Story not found in single story API response.');
        console.error(singleStoryData);
      }
    } else {
      console.log('No stories found in the database.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
