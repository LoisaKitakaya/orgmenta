// A 'display' is a way of viewing entities, their relationships, and their attributes.
// It is a 'perspective into the graph'.
// You can view entities and their relationships in different displays (e.g. Table, list, calendar) and filters.

import { ViewRouterLink, ViewRouterLinkthemed, useRouterLocation } from "./router";
import { ViewFormDynamic } from "./form";
import { ViewListMain } from "./list";
import { ViewChartMain } from "./chart";
import { ViewPathMain } from "./path";
import {
  ViewPodMain,
  ViewPodInfo,
  ViewPodList,
  ViewPodTabs,
  ViewPodExample,
} from "./pod";
import { ViewIconMain } from "./icon";
// import { ViewTableMain, useTableColumns } from "./table";
// import { ViewJsonMain } from "./json";
// import { ViewIconMain } from "./icon";

import { memo, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
// import MapChart from "../components/displays/maps";
// import ViewDisplayCalendar from "../components/displays/calendar/ViewDisplayCalendar";
// import ViewDisplayForm from "../components/displays/forms/ViewDisplayForm";
// import ViewDisplayList from "../components/displays/list/ViewDisplayList";
// import ViewDisplayMaps from "../components/displays/maps/ViewDisplayMaps";
// import ViewDisplayPods from "../components/displays/pods/ViewDisplayPods";
// import ViewDisplayTable from "../components/displays/table/ViewDisplayTable";
// import ViewJsonMain from "../components/displays/json/ViewJsonMain";
import Timeline from "react-native-timeline-flatlist";
import { Calendar } from "react-native-calendars";

// Dynamic

export const ViewDisplayDynamic = memo(
  ({ auxiliary, schema, focus, display }: any) => {
    // The main display component that switches between different components
    const Component = mapDisplayComponents[display || "list"]; // may need to memoize/useCallback this
    return <Component auxiliary={auxiliary} schema={schema} focus={focus} />;
  }
);

// Displays

// These components transform the entity/schema/relationships data then provide them to the relevant component
// (e.g. ViewDisplayTable transforms entities data, then provides them to the table component from table.js )
// Chris is owning the below components.

export const ViewDisplayList = (props: any) => {
  const auxiliary = props.auxiliary;
  // const focus = props.focus;
  return <ViewListMain data={auxiliary?.data} />;
};

export const ViewDisplayPod = (props: any) => {
  const schema = props.schema;
  const auxiliary = props.auxiliary;
  const focus = props.focus;
  const data = "make focus into an array and concat with aux";
  return (
    <ViewPodMain items={auxiliary} schema={schema.data}>
      <ViewPodInfo />
      <ViewPodTabs />
      <ViewPodList title={"Example List Pod"} data={auxiliary.data} />
      <ViewPodExample />
      <ViewPodExample />
      <ViewPodExample />
    </ViewPodMain>
  );
};

// Form

export const ViewDisplayForm = (props: any) => {
  // Chris todo: auxiliary data doesn't have relationship ids yet, so 'if(oldItem.focus_columns.cell_field==='relationship'){' does nothing yet
  // create the appropriate schema for the form
  let data: any = useMemo(() => {
    let items: any = [];

    if (props.schema && props.focus.data && props.auxiliary) {
      props?.schema?.data?.forEach((oldItem: any) => {
        let newItem = { ...oldItem, ...oldItem.auxiliary_columns };
        // if the attribute is 'relationship' we know that it is in the relationship table instead of being a column on the entity table.
        if (oldItem.focus_columns.cell_field === "relationship") {
          newItem.table = "relationships";
          newItem.value = "(relationships)"; //'props.auxiliary.data to be filtered here (todo)'
        } else {
          newItem.table = "entities";
          newItem.value = props.focus.data?.[0]?.[newItem.name_singular];
        }

        delete newItem.focus_columns;
        delete newItem.auxiliary_columns;
        items.push(newItem);
      });

      return items;
    }
  }, [props.schema, props.focus.data, props.auxiliary]);
  return <ViewFormDynamic data={data} />;
};

// Table

export const ViewDisplayTable = (props: any) => {
  const schema = props.schema;
  // const columns = useTableColumns(
  //   schema.data?.map(
  //     (x: { focus_columns: { name_singular: any } }) =>
  //       x.focus_columns.name_singular
  //   )
  // );
  const auxiliary = props.auxiliary;
  return (
    <>
      <ViewTableTabs />
      {/* <ViewTableMain columns={columns} data={auxiliary.data} /> */}
    </>
  );
};

// Calendar

export const ViewDisplayCalendar = (props: any) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);

  const events = [
    {
      date: "2023-09-27",
      title: "Meeting with Client",
      description: "Discuss project details",
    },
    {
      date: "2023-09-28",
      title: "Meeting with another Client",
      description: "Discuss another project details",
    },
    // Add more events as needed
  ];

  // Dynamically generate marked dates from the events array
  const marked = events.reduce((markedDates: any, event) => {
    const { date } = event;
    markedDates[date] = { marked: true };
    return markedDates;
  }, {});

  const onDayPress = (day: any) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);

    // Check if there are events for the selected date
    if (events.find((event) => event.date === dateString)) {
      setEventModalVisible(true);
    }
  };

  return (
    <View style={{ maxHeight: 400 }}>
      <Calendar
        hideArrows={false}
        // showWeekNumbers={true}
        markedDates={marked}
        onDayPress={onDayPress}
        onDayLongPress={(day) => console.log("onDayLongPress", day)}
        onMonthChange={(date) => console.log("onMonthChange", date)}
        onPressArrowLeft={(goToPreviousMonth) => {
          console.log("onPressArrowLeft");
          goToPreviousMonth();
        }}
        onPressArrowRight={(goToNextMonth) => {
          console.log("onPressArrowRight");
          goToNextMonth();
        }}
      />

      {/* Event Modal */}
      <Modal
        visible={eventModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
              width: "80%",
            }}
          >
            <TouchableOpacity
              onPress={() => setEventModalVisible(false)}
              style={{ alignSelf: "flex-end" }}
            >
              <Text style={{ color: "blue" }}>Close</Text>
            </TouchableOpacity>
            <Text>Events on {selectedDate}:</Text>
            {events
              .filter((event) => event.date === selectedDate)
              .map((event, index) => (
                <View key={index} style={{ marginTop: 10 }}>
                  <Text>{event.title}</Text>
                  <Text>{event.description}</Text>
                </View>
              ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Timeline
export const ViewDisplayTimeline = (props: any) => {
  const data = [
    { time: "09:00", title: "Event 1", description: "Event 1 Description" },
    { time: "10:45", title: "Event 2", description: "Event 2 Description" },
    { time: "12:00", title: "Event 3", description: "Event 3 Description" },
    { time: "14:00", title: "Event 4", description: "Event 4 Description" },
    { time: "16:30", title: "Event 5", description: "Event 5 Description" },
  ];

  return (
    <View style={{ maxHeight: 400 }}>
      <Text style={{ fontSize: 25, marginBottom: 10 }}>Timeline</Text>
      <Timeline data={data} />
    </View>
  );
};

// Maps

export const ViewDisplayMaps = (props: any) => {
  return (
    <View style={{ maxHeight: 400 }}>
      {/* <MapChart /> */}
      {/* todo */}
    </View>
  );
};

// Json

export const ViewDisplayJson = (props: any) => {
  const schema = props.schema;
  const auxiliary = props.auxiliary;
  // const columns = useTableColumns(
  //   schema.data?.map((x: any) => x.focus_columns.name_singular)
  // );
  return (
    <View style={{ flexDirection: "column" }}>
      {/* <ViewJsonMain schema={schema} auxiliary={auxiliary} columns={columns} /> */}
      {/* todo */}
    </View>
  );
};

// Components

export const mapDisplayComponents: any = {
  pods: ViewDisplayPod,
  form: ViewDisplayForm,
  list: ViewDisplayList,
  table: ViewDisplayTable,
  calendar: ViewDisplayCalendar,
  timeline: ViewDisplayTimeline,
  maps: ViewDisplayMaps,
  chart: ViewDisplayJson,
  path: ViewDisplayJson,
  json: ViewDisplayJson,
};

// Options

export const optionsDisplayMain = [
  { title: "Pods", iconName: "view-quilt", iconSource: "MaterialIcons" },
  { title: "Form", iconName: "view-list-outline", iconSource: "MaterialCommunityIcons" },
  { title: "List", iconName: "list", iconSource: "Feather" },
  { title: "Table", iconName: "table", iconSource: "AntDesign" },
  { title: "Calendar", iconName: "calendar", iconSource: "Feather", },
  { title: "Timeline", iconName: "timeline", iconSource: "MaterialIcons", },
  { title: "Maps", iconName: "map", iconSource: "Feather", },
  { title: "Chart", iconName: "piechart", iconSource: "AntDesign", },
  // { title: "Path", iconName: "share", iconSource: "Foundation", },
  // { title: "Json", iconName: "code-json", iconSource: "MaterialCommunityIcons"},
  // { title: "Kanban", iconName: "view-column", iconSource: "MaterialIcons"},
  // { title: "Gantt", iconName: "chart-gantt", iconSource: "MaterialCommunityIcons"},
  // { title: "Threads", iconName: "wechat", iconSource: "AntDesign"},
  // { title: "Nodes", iconName: "map-marker-path", iconSource: "MaterialCommunityIcons"},
  // { title: "Spacial", iconName: "printer-3d", iconSource: "MaterialCommunityIcons"},
];

// Tabs

export const ViewDisplayTabs = ({ id, display }: any) => {
  return (
    <View
      style={{
        flexDirection: "column",
        position: "absolute",
        right: 0,
        top: 100,
        backgroundColor: "gray",
      }}
    >
      {optionsDisplayMain?.map((x, i) => (
        <ViewRouterLinkthemed key={i}
          style={{
            padding: 5,
            backgroundColor: display === x.title.toLowerCase() ? "gray" : "lightgray",
          }}
          to={`entity/../../${x.title.toLowerCase()}`}
        >
          <ViewIconMain name={x.iconName} source={x.iconSource} color={"white"} />
          {/* <Text>{display}{x.title.toLowerCase()}</Text> */}
        </ViewRouterLinkthemed>
      ))}
    </View>
  );
};

// TableTabs (Temp)

// 'Table Tabs' will be a subcomponent of 'Table' (like 'Table Footer' and'Table Header' are table subcomponents )
// To be moved into the table file (but added here since it is a placeholder and so as not to interfere with current works)
// Or, since this might need to be used by List (and maybe others like timeline) as well, maybe it needs to be its own 'display tabs' module or else we just directly use a primitive 'tabs' module in ViewDisplayTable, ViewDisplayList etc.
// At the moment, it just has 'Types' hardcoded into it as the tabs.
// But, it will be made dynamic (which will allow things like plugins and user interactions to hide this component, switch out the tabs to 'Status' or  other property groupings, etc.)
export const ViewTableTabs = (props: any) => {
  return <Text>["Area","Event","Contact","etc."]</Text>;
};
