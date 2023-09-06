import { ScrollView, useWindowDimensions } from "react-native";
import { newData as data } from "../../utils/static";
import { Expandable } from "../expandable";
import React from "react";

export default function Sidebar() {
  const height = useWindowDimensions().height - 50;
  
  return (
    <ScrollView style={{ height: height }}>
      {
        data // temporary array that contains all the navigation objects
          .filter(
            (x) => (x.status === "3. Active" || __DEV__) && x.parent === 1
          ) // if in production, only show active modules
          .map((x, i) => (
            <Expandable item={x} key={i} />
          )) // display the name only (temporary, to be replaced with link)
      }
    </ScrollView>
  );
}