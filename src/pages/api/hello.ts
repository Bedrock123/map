// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Ignore typescript error for now
// @ts-ignore
import type { NextApiRequest, NextApiResponse } from "next";
import geoblaze from "geoblaze";
import area from "@turf/area";
import centroid from "@turf/centroid";

var createGeoJSONCircle = function (center, outerRadiusInKm, points) {
  if (!points) points = 64;

  var coords = {
    latitude: center[1],
    longitude: center[0],
  };

  var km = outerRadiusInKm;

  var ret = [];
  var distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  var distanceY = km / 110.574;

  var theta, x, y;
  for (var i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);

    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [ret],
        },
      },
    ],
  };
};

type Data = {
  population?: string;
  mapType?: string;
  blastAreaKm?: string;
  resultDampening?: number;
  error?: string;
  hasExpandedBlastGeoJson?: boolean;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const body = req.body;

  let blastGeoJson = body.data;
  const blastAreaM = area(blastGeoJson);
  const blastAreaKm = blastAreaM / 1000000;

  let _resultDampening = 1;
  let _expandedBlastGeoJson;

  // If the blast area is too small, expand it and then dampen the result
  if (blastAreaKm <= 0.5) {
    const blastCenterGeoJson = centroid(blastGeoJson);
    const blastCenterCoordinates = blastCenterGeoJson.geometry.coordinates;

    _expandedBlastGeoJson = createGeoJSONCircle(
      blastCenterCoordinates,
      4.9,
      64 * 4
    );
    const _expandedBlastGeoJsonAreaM = area(_expandedBlastGeoJson);
    _resultDampening = (blastAreaM / _expandedBlastGeoJsonAreaM) * 2;
  }

  // Determine the map type to use
  let populationMapType = "pop4";

  if (blastAreaKm > 1500) {
    populationMapType = "pop3";
  }

  if (blastAreaKm > 15000) {
    populationMapType = "pop2";
  }
  if (blastAreaKm > 30000) {
    populationMapType = "pop1";
  }

  console.log("blastAreaKm", blastAreaKm);
  console.log("populationMapType", populationMapType);
  console.log("_resultDampening", _resultDampening);

  try {
    // Calculate the population
    const georaster = await geoblaze.parse(
      `https://map-gules.vercel.app/maps/${populationMapType}.tif`
    );
    const populationResult = await geoblaze.sum(
      georaster,
      _expandedBlastGeoJson || blastGeoJson
    );

    res.status(200).json({
      population: (
        parseInt(populationResult) * _resultDampening
      ).toLocaleString("en-US"),
      mapType: populationMapType,
      blastAreaKm: blastAreaKm.toLocaleString("en-US"),
      resultDampening: _resultDampening,
    });
  } catch {
    res.status(500).json({
      error: "Something went wrong",
      mapType: populationMapType,
      blastAreaKm: blastAreaKm.toLocaleString("en-US"),
      resultDampening: _resultDampening,
      hasExpandedBlastGeoJson: _expandedBlastGeoJson ? true : false,
    });
  }
};

export default handler;
