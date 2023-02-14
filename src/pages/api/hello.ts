// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Ignore typescript error for now
// @ts-ignore
import type { NextApiRequest, NextApiResponse } from "next";
import geoblaze from "geoblaze";
import area from "@turf/area";
type Data = {
  population: number;
  mapType: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const body = req.body;

  // Get the blast area in meters
  const blastArea = area(body.data);

  // Convert to km
  const blastAreaKm = blastArea / 1000000;

  let populationMapType = "pop1";

  if (blastAreaKm > 10000) {
    populationMapType = "pop2";
  } else if (blastAreaKm > 100000) {
    populationMapType = "pop3";
  } else if (blastAreaKm > 1000000) {
    populationMapType = "pop4";
  }

  const georaster = await geoblaze.parse(
    `https://map-gules.vercel.app/maps/${populationMapType}.tif`
  );

  const result = await geoblaze.sum(georaster, body.data);

  res.status(200).json({ population: result, mapType: populationMapType });
};

export default handler;
