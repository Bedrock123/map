// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Ignore typescript error for now
// @ts-ignore
import type { NextApiRequest, NextApiResponse } from "next";
import geoblaze from "geoblaze";
import path from "path";
import { promises as fs } from "fs";
import { readFileSync } from "fs";

type Data = {
  name: string;
};

const boundingBox = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [
            [-80.56826239984372, 28.315122155740866],
            [-81.48928985428935, 30.551290693619507],
            [-82.3988513837634, 30.639058236741633],
            [-86.11767787006798, 30.889368071054776],
            [-87.7159619004814, 30.976778516792066],
            [-87.6831408960683, 30.27640242656915],
            [-80.7368624110119, 25.008420617522717],
            [-79.99656052038213, 25.48528452307913],
            [-79.75488321239801, 26.965976918322482],
            [-80.56826239984372, 28.315122155740866],
          ],
        ],
        type: "Polygon",
      },
    },
  ],
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  //Find the absolute path of the json directory

  const georaster = await geoblaze.parse(
    "https://map-gules.vercel.app/pop.tif"
  );

  const result = await geoblaze.sum(georaster, boundingBox);

  res.status(200).json({ name: result });
};

export default handler;
