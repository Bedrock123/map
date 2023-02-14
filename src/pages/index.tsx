import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import geoblaze from "geoblaze";
import { useState } from "react";

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

function Child() {
  const [count, setCount] = useState(0);
  return <>{count}</>;
}

export default function Home() {
  const [count, setCount] = useState(0);
  return <Child />;
}
