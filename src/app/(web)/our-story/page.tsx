// page.tsx
import React from 'react';

const Page = () => {
  return (
    <div>
      <h1>This is a sample page</h1>
      <p>Welcome to the {process.env.NEXT_PUBLIC_PAGE_NAME} page.</p>
    </div>
  );
};

export default Page;
