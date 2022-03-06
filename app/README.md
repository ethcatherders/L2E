# Learn-2-Earn App

## Tech Stack
The proposed technologies to be used for the initial version of this app are the following:
- NextJS
- Chakra UI
- Moralis
- POAP

These were initially proposed for the sake of ease and fast development. The tech stack can be changed and improved as development evolves. Any proposals for other technologies can be submitted in the issues or suggested in the ECH discord server.

## Moralis
All the data including users, course content, and POAP info will be stored in the Moralis server database as separate collections. Here are the initially proposed schemas for an object in each type of collection:
- Users - Moralis automatically makes this object by defualt, but these attributes will be the most relevant for the L2E app.
```JSON
{
    ethAddress: ["0xExampleAddress"],
    email: "example@email.com (optional - for notifications)",
    coursesCompleted: [], // ID of object in Course collection (Relational)
    poapsEarned: [], // ID of object in POAP collection (Relational)
}
```
- POAPs - to store key information of each POAP for querying and managing.
```JSON
{
  name: "POAP Name",
	source: "URL",
	mintLinks: ["mintlink", ...], // Delete each item from array after being used
	course: "Course ID", // ID of object in Course collection (Relational)
	previewImg: "Image source URL"
}
```
- Courses
```JSON
{
	videoUrl: "YouTube link",
	quiz: [
		{
			id: 1,
			question: "Question 1",
			options: ["Option 1", "Option 2", ...]
		},
		{
			id: 2,
			question: "Question 2",
			options: ["Option 1", "Option 2", ...]
		}
		// ..etc.
	],
	// Each answer is the index of the correct item for each "options" array within quiz object item
	answers: [1, 3, 0, 2, ...],
	responses: [
		{
			user: "USER ID", // ID of object in User collection (Relational)
			answers: [1, 3, 2, 1] // Index of chosen option per answers object
		}
	],
	poap: "POAP ID" // ID of object in POAP collection (Relational)
}
```

## Getting Started
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
