// Chris is working on this.
// It is a form of display (alongside calendar, table etc.).
// This display is resizable 'pods' that can be moved around on a grid, pinned etc.
// E.g. on the 'invoicing' category entity, you could pin an 'unsent invoices count' widget to to this display.

import {
  ViewContainerStatic,
  ViewContainerColumn,
  ViewContainerRow,
  ViewContainerScroll,
} from "./container";
import { ViewRouterLink, useRouterLocation } from "./router";
import { ViewListMain } from "./list";
import { ViewTypographySubheading, ViewTypographyText } from "./typography";
import { useAuxiliaryArray } from "./auxiliary";
import { useSpaceState, TypeSpaceState } from "./space";
import { useEntitySingle } from "./entity";
import { data } from "./static";
import { useAuthSession } from "./auth";
import { ViewContextContainer, useContextState } from "./context";

// CONTAINER

export const ViewPodContainer = ({ items, children }: any) => {
  // A comtainer to show all enabled 'pods' (widgets for the 'front page of a business module')
  const isGuest = useAuthSession()?.data?.currentUser === "Guest";
  const helpEnabled = useContextState()?.data?.enabled;
  const salesEnabled = true; // to do
  return (
    <ViewContainerScroll style={{ flex: 1 }}>
      <ViewPodInfo />
      <ViewPodTabs />
      {(isGuest || salesEnabled) && <ViewPodSalescopy />}
      {(isGuest || helpEnabled) && <ViewPodGuides />}
      <ViewPodCategoryrelated />
    </ViewContainerScroll>
  );
};

// List

export const ViewPodList = ({ items, children }: any) => {
  return <ViewTypographyText>ViewPodList (todo)</ViewTypographyText>;
};

// Example

export const ViewPodExample = () => {
  // Temporary examplepod
  return (
    <ViewContainerColumn
      style={{
        margin: 5,
      }}
    >
      <ViewContainerStatic style={{ height: 40, backgroundColor: "lightgray" }}>
        <ViewTypographyText style={{ fontSize: 16, fontStyle: "italic" }}>
          Another Example Pod
        </ViewTypographyText>
        <ViewTypographyText style={{ fontSize: 12 }}>
          To be replaced with dynamic pods using db data
        </ViewTypographyText>
      </ViewContainerStatic>
    </ViewContainerColumn>
  );
};

// INFO

// A pod to show information on the currently selected entity
// This is using static data for categories only at the moment (e.g. Accounts-Payables-Bills), but will eventually be a dynamic component using  db data.
export const ViewPodInfo = () => {
  // At the moment, this shows static info for categories (e.g. governance > model > plan) from static.js. But it will eventually be able to display a titlebar / breadcrumb bar for any entity from the database.
  const path = useRouterLocation()?.paths;
  const process = data?.find((x) => x.nickname === path[2]);
  const isGuest = useAuthSession()?.data?.currentUser === "Guest";
  const helpEnabled = useContextState()?.data?.enabled;
  const salesEnabled = true; // to do
  return (
    <ViewContainerColumn
      style={{
        margin: 5,
        borderWidth:1,
      }}
    >
      <ViewContainerStatic style={{ backgroundColor: "lightgray" }}>
        <ViewTypographyText style={{ fontSize: 14, fontStyle: "italic" }}>
          {process?.description}
        </ViewTypographyText>
        <ViewTypographyText style={{ fontSize: 12 }}>
          {process?.summary}
        </ViewTypographyText>
      </ViewContainerStatic>
    </ViewContainerColumn>
  );
};

// TABS

// A component to show entity 'tabs' (e.g. Accounts > Payables > Bills/Payments/etc)
// This is using static data for categories only at the moment, but will eventually be a dynamic component using  db data.
export const ViewPodTabs = () => {
  // At the moment, this shows breadcrumbs for categories (e.g. governance > model > plan) from static.js
  // But it will eventually be able to display a titlebar / breadcrumb bar for any entity from the database.
  const path = useRouterLocation()?.paths;
  const process = data?.find((x) => x.nickname === path[2]);
  const subprocesses = process && data.filter((x) => x.parent === process.id);
  return (
    <ViewContainerColumn
      style={{
        margin: 5,
        borderWidth: 1,
      }}
    >
      {/* Tabs for each subprocess */}
      <ViewContainerRow style={{ height: 20 }}>
        {subprocesses?.map((x, i) => (
          <ViewRouterLink
            style={{ flex: 1 }}
            key={i}
            to={`/entity/` + x.nickname}
          >
            <ViewTypographyText>{x.display_singular}</ViewTypographyText>
          </ViewRouterLink>
        ))}
      </ViewContainerRow>
    </ViewContainerColumn>
  );
};

// CATEGORYRELATED TEMP
export const ViewPodCategoryrelated = (props: any) => {
  const spaceSelected = useSpaceState(["space", "selected"]);
  const routerPaths = useRouterLocation()?.paths;
  const auxiliary = useAuxiliaryArray({
    space_name: (spaceSelected as TypeSpaceState)?.data?.spacename,
    filters_array: [], //todo
    column_names: [], //todo
  });
  const auxiliaryRelated = auxiliary?.data?.filter((x: any) =>
    x.entities.categories?.includes(routerPaths[2])
  );
  return (
    <ViewContainerStatic
      style={{
        margin: 5,
        borderWidth: 1,
      }}
    >
      <ViewTypographySubheading>
        Related Items (temp, uses static categories)
      </ViewTypographySubheading>
      <ViewListMain data={auxiliaryRelated} />
    </ViewContainerStatic>
  );
};

// GUIDE
export const ViewPodGuides = (props: any) => {
  return (
    <ViewContainerStatic
      style={{
        margin: 5,
        borderWidth: 1,
      }}
    >
      <ViewTypographySubheading>Guides</ViewTypographySubheading>
      <ViewTypographyText>Show related guides here.</ViewTypographyText>
    </ViewContainerStatic>
  );
};

// GUIDE
export const ViewPodSalescopy = (props: any) => {
  // A pod for the sales pitch to each specific module.
  // SHOW THIS IF USER IS NOT LOGGED IN.
  return (
    <ViewContainerStatic
      style={{
        borderWidth: 1,
        margin: 5,
        backgroundColor: "lightgreen",
        maxHeight: "100%",
        height: "100%",
      }}
    >
      <ViewTypographyText>
        ^--- These are the submodules (explain each, get data from the
        categories array)
      </ViewTypographyText>
      <ViewTypographySubheading>
        SALESPITCH FOR THE MODULE
      </ViewTypographySubheading>
      <ViewTypographySubheading>
        Sales pitch here using the data from the module object (static.tsx for
        the time being) here. Above the fold in the pods screen. point to
        relevant areas of the screen an explain them.
      </ViewTypographySubheading>
      <ViewTypographyText>
        V--- You're in the 'Pods' display at the moment, but you can switch the
        display to view the module with different display types here
      </ViewTypographyText>
    </ViewContainerStatic>
  );
};
