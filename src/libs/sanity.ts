import { createClient } from 'next-sanity';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: process.env.NODE_ENV === 'production',
  // token:
  //   'skGTILSbakwyjd19Ou3ev345iatPIU1BO2JCzfW9gOHnTn9IKrOl6OCwWCVMp74oRUsuOqf8JB6WsSMAH5m3LtSp1QzQl5L2xRgFiTqOjRoFivYuNZmSWYSQoA86uQo2VtX4ZXCdSGlEHoODuQDDuBuDuwZtP6qB1XUKmBal6TjcBdPL4sP0',
  token: process.env.SANITY_STUDIO_TOKEN,
  apiVersion: '2021-10-21',
});

export default sanityClient;
