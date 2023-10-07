// the 'user' module is comprised of the following submodules / module relationships
// - auth(/session)
// - profile
// - memberships
// - permissions
// - devices (the windows/apps/devices they log in from)
// - alerts / notifications

import {
  ViewTypographyHeading,
  ViewTypographySubsubheading,
  ViewTypographyText,
} from "./typography";
import { ViewModalMain } from "./modal";
import { ViewCardExpandable } from "./card";
import { ViewRouterLinkthemed } from "./router";
import { ViewContainerScroll, ViewContainerStatic } from "./container";
import { ViewButtonPressable } from "./button";
import { ViewIconMain } from "./icon";
import { ViewPageMain } from "./page";
import { ViewDisplayDynamic } from "./display";
import { instanceSupabaseClient, handleSupabaseResponse } from "./supabase";
import { useAttributeUnioned } from "./attribute";
import { useQueryerQuery } from "./queryer";
import { useWindowDimensions } from "./window";
import { useModalVisibility } from "./modal";
import {
  useAuthSession,
  useAuthSignout,
  ViewAuthSignin,
  ViewAuthSignup,
} from "./auth";
import { useState } from "react";
// import MSAL from "../../../auth/msal";

// PAGE

export const ViewUserPage = () => {
  const auth = useAuthSession();
  const user = useUserSingle(auth?.data?.session?.id);
  return (
    <ViewPageMain>
      <ViewTypographyHeading>User</ViewTypographyHeading>
      <ViewContainerStatic style={{ maxWidth: 500 }}>
        <ViewTypographyText style={{ marginBottom: 10 }}>
          ViewAuthDetails
        </ViewTypographyText>
        {auth.data && (
          <ViewTypographyText>
            Logged in as: {auth?.data?.session?.user?.email}
          </ViewTypographyText>
        )}
      </ViewContainerStatic>
      <ViewUserAttributes />
      <ViewDisplayDynamic />
    </ViewPageMain>
  );
};

// ATTRIBUTES

export const useUserAttributes = () => {
  const attributes = useAttributeUnioned(["User"]);
  return attributes;
};

// Placeholder - CG working on this.
export const ViewUserAttributes = () => {
  const attributes = useUserAttributes();
  return (
    <>
      {attributes?.data?.map((x: any, i: string) => (
        <ViewContainerStatic key={i}>
          <ViewTypographyText>
            {x?.focus_columns?.name_singular}
          </ViewTypographyText>
        </ViewContainerStatic>
      ))}
    </>
  );
};

// MODAL

export const ViewUserModal = (props: any) => {
  return (
    <ViewModalMain
      modalName={"user"}
      snapto={"right"}
      backdrop
      pinnable
      collapsible
    >
      <ViewContainerScroll>
        <ViewUserSession />
        <ViewUserSwitch />
        <ViewUserLinks />
        <ViewUserPrivacy />
        <ViewUserActivity />
        <ViewUserNotifications />
        <ViewUserComms />
        <ViewUserDevice />
      </ViewContainerScroll>
    </ViewModalMain>
  );
};

// ACTIVITY

// Widget to show the active entities for that user (e.g. what is the current event being worked on)
export const ViewUserActivity = () => {
  return (
    <ViewCardExpandable
      startExpanded
      header={"Activity"}
      body={
        <>
          <ViewTypographyText>ACTIVITY</ViewTypographyText>
          <ViewTypographyText>[Next events]</ViewTypographyText>
          <ViewTypographyText>
            [Link to show all user events]
          </ViewTypographyText>
        </>
      }
    />
  );
};

// PRIVACY

// Widget to show cookie/tracking/privacy options
export const ViewUserPrivacy = () => {
  const [shieldState, shieldSet] = useState(true);
  const [infoState, infoSet] = useState(false);
  return (
    <ViewCardExpandable
      startExpanded
      header={"Privacy"}
      body={
        <>
          <ViewContainerStatic style={{ flexDirection: "row", flex: 1 }}>
            <ViewButtonPressable
              style={{
                flexDirection: "row",
                padding: 5,
                flex: 1,
                height: 50,
                backgroundColor: shieldState ? "gray" : "lightgray",
              }}
              onPress={() => shieldSet((old) => !old)}
            >
              <ViewTypographySubsubheading
                selectable={false}
                style={{ flex: 1 }}
              >
                Privacy Shield:
              </ViewTypographySubsubheading>
              <ViewIconMain
                name={shieldState ? "shield" : "shield-off"}
                source={"Feather"}
                color={"white"}
              />
            </ViewButtonPressable>
            <ViewButtonPressable
              style={{
                flexDirection: "row",
                padding: 5,
                height: 50,
              }}
              onPress={() => infoSet((old) => !old)}
              onHoverIn={() => infoSet(true)}
              onHoverOut={() => infoSet(false)}
            >
              <ViewIconMain name={"info"} source={"Feather"} color={"black"} />
              {/* todo: fix opacity (coming from a parent somewhere?) */}
              {infoState && (
                <ViewContainerStatic
                  style={{
                    position: "absolute",
                    backgroundColor: "rgba(211,211,211, 1)",
                    bottom: -50,
                    left: -125,
                    width: 175,
                    height: 50,
                  }}
                >
                  <ViewTypographyText>
                    Shield is{" "}
                    {shieldState
                      ? "ON. Your fields are hidden in the UI (TODO)"
                      : "OFF. Your fields are visible in the UI. (TODO)"}
                  </ViewTypographyText>
                </ViewContainerStatic>
              )}
            </ViewButtonPressable>
          </ViewContainerStatic>
          <ViewTypographyText>[cookies & tracking]</ViewTypographyText>
        </>
      }
    />
  );
};

// NOTIFICATIONS

// Widget to show the recent notifications/logs for that user (e.g system alerts, logs for changes to entities that the user is 'following'/assinged to, etc.
export const ViewUserNotifications = () => {
  return (
    <ViewCardExpandable
      startExpanded
      header={"Notifications"}
      body={
        <>
          <ViewTypographyText>todo</ViewTypographyText>
        </>
      }
    />
  );
};

// COMMS

// Widget to show the recent messages/communications for that user
export const ViewUserComms = () => {
  return (
    <ViewCardExpandable
      startExpanded
      header={"Comms"}
      body={
        <>
          <ViewTypographyText>[Recent messages]</ViewTypographyText>
          <ViewTypographyText>
            [Link to all messages (user/userid/messages)]
          </ViewTypographyText>
        </>
      }
    />
  );
};

// DEVICE

// Widget to show the devices that the user has logged in with / has preferences shieldSet for.
export const ViewUserDevice = () => {
  return (
    <ViewCardExpandable
      startExpanded
      header={"Devices"}
      body={
        <>
          <ViewTypographyText>
            [Current Device Info (e.g. sync status)]
          </ViewTypographyText>
          <ViewTypographyText>
            [Link to all devices (user/userid/devices)]
          </ViewTypographyText>
        </>
      }
    />
  );
};

// Widget to switch between different users (future functionality)
export const ViewUserSwitch = () => {
  // TODO
  const array = { data: [{ id: "TEMP", nickname: "TEMP" }] };
  const updater = (id: string, nickname: string) => "temp";
  return (
    <ViewCardExpandable
      startExpanded
      header={"Switch User"}
      body={array?.data?.map((x, i) => (
        <ViewButtonPressable
          key={i}
          style={{ padding: 10, margin: 5, backgroundColor: "lightgray" }}
          onPress={() => updater(x.id, x.nickname)}
        >
          <ViewTypographyText>
            {x.nickname}
            {x.id}
          </ViewTypographyText>
        </ViewButtonPressable>
      ))}
    />
  );
};

export const ViewUserSignin = () => {
  const auth = useAuthSession();
  const signout = useAuthSignout();
  const handleTabPress = (index: number) => {
    setActiveTab(index);
  };
  const tabs = [
    { tab: "Sign in", component: <ViewAuthSignin /> },
    { tab: "Sign up", component: <ViewAuthSignup /> },
  ];
  const [activeTab, setActiveTab] = useState(0);
  return (
    <>
      <ViewContainerStatic style={{ flexDirection: "row" }}>
        {tabs.map((content, index) => (
          <ViewContainerStatic
            key={index}
            style={{ flexDirection: "row", flex: 1 }}
          >
            <ViewButtonPressable
              key={index}
              style={{
                flex: 1,
                padding: 10,
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderLeftWidth: 1,
                borderTopRightRadius: 5,
                borderTopLeftRadius: 5,
                borderColor: activeTab === index ? "black" : "transparent",
                backgroundColor:
                  activeTab === index ? "lightblue" : "transparent",
              }}
              onPress={() => handleTabPress(index)}
            >
              <ViewTypographyText
                selectable={false}
                style={{ fontWeight: "bold" }}
              >
                {content.tab}
              </ViewTypographyText>
            </ViewButtonPressable>
          </ViewContainerStatic>
        ))}
      </ViewContainerStatic>
      <ViewContainerStatic>{tabs[activeTab].component}</ViewContainerStatic>
    </>
  );
};
// Widget to show options/links for the current logged in user
export const ViewUserSession = () => {
  const auth = useAuthSession();
  const signout = useAuthSignout();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { tab: "Sign in", component: <ViewAuthSignin /> },
    { tab: "Sign up", component: <ViewAuthSignup /> },
  ];
  const handleTabPress = (index: number) => {
    setActiveTab(index);
  };
  return (
    <ViewCardExpandable
      startExpanded
      header={auth?.data?.nickUpper || "Sign In/Up"}
      body={
        auth?.data?.session === null ? (
          <ViewUserSignin />
        ) : (
          <ViewContainerStatic>
            <ViewRouterLinkthemed
              style={{ margin: 5 }}
              to={`/users/${auth?.data?.session?.user?.id || "guest"}/pods`}
            >
              <ViewTypographySubsubheading selectable={false}>
                Profile
              </ViewTypographySubsubheading>
            </ViewRouterLinkthemed>
            <ViewRouterLinkthemed
              style={{ margin: 5 }}
              to={`/users/${auth?.data?.session?.user?.id || "guest"}/devices`}
            >
              <ViewTypographySubsubheading selectable={false}>
                Devices
              </ViewTypographySubsubheading>
            </ViewRouterLinkthemed>
            <ViewRouterLinkthemed
              style={{ margin: 5 }}
              to={`/users/${auth?.data?.session?.user?.id || "guest"}/settings`}
            >
              <ViewTypographySubsubheading selectable={false}>
                Settings
              </ViewTypographySubsubheading>
            </ViewRouterLinkthemed>
            <ViewRouterLinkthemed
              style={{ margin: 5 }}
              to={`/users/${
                auth?.data?.session?.user?.id || "guest"
              }/pods/events`}
            >
              <ViewTypographySubsubheading selectable={false}>
                All Events
              </ViewTypographySubsubheading>
            </ViewRouterLinkthemed>
            <ViewButtonPressable
              style={{ margin: 5 }}
              onPress={() => {
                signout.mutate();
              }}
            >
              <ViewTypographySubsubheading selectable={false}>
                Signout
              </ViewTypographySubsubheading>
            </ViewButtonPressable>
          </ViewContainerStatic>
        )
      }
    />
  );
};

// Widget to show user links (not dependent on who is logged in)
export const ViewUserLinks = () => {
  return (
    <ViewCardExpandable
      startExpanded
      header={"Navigation"}
      body={
        <ViewContainerStatic>
          <ViewRouterLinkthemed style={{ margin: 5 }} to={`/users/all`}>
            <ViewTypographySubsubheading selectable={false}>
              All Users
            </ViewTypographySubsubheading>
          </ViewRouterLinkthemed>
        </ViewContainerStatic>
      }
    />
  );
};

// Active

// This is a useQueryerQuery query that just returns a blank object (it doesn't query anything).
// Then you can switch between active users/uservariables, which will update this query.
// Actual usage/structure not yet confirmed, this is a proof of concept.
export const useUserActive = ({ ...Input }: TypeUserActive) => {
  const session = useAuthSession();
  const query = useQueryerQuery({
    queryKey: ["user", "active"],
    queryFn: () => {
      return {};
    },
    enabled: false,
    initialData: {
      id: null,
      title: "User",
      session,
    },
  });
  return query;
};

export type TypeUserActive = any; // placeholder

// import { useQuery } from "@tanstack/react-query";

export const useUserSingle = (id: string) => {
  const queryKey = ["user", "single", id];
  const queryFn = async () => requestUserSingle(id);
  const query = useQueryerQuery(queryKey, queryFn, {
    enabled: id ? true : false,
  });
  return query;
};

export const requestUserSingle = async (id: string) => {
  const query = instanceSupabaseClient.from("users").select();
  query
    .range(0, 0) //temp arbitrary limit of 10 (todo: pass variables in here to get proper pagination)    .then((response) => response.data);
    .eq("id", id)
    .then(handleSupabaseResponse as any);
  return query;
};

export const ViewUserWidget = () => {
  const auth = useAuthSession();
  const window = useWindowDimensions();
  // const userActive = useUserActive({}) as TypeUserActive;
  return (
    <ViewButtonPressable
      onPress={useModalVisibility("user")}
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        flex: 1,
        flexDirection: "row",
      }}
    >
      {window?.width > 600 && (
        <ViewTypographyText
          selectable={false}
          numberOfLines={1}
          style={{ paddingRight: 10, color: "white" }}
        >{`${auth?.data?.nickUpper}`}</ViewTypographyText>
      )}
      <ViewIconMain
        name={"user"}
        source={"Feather"}
        color={"white"}
        size={30}
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </ViewButtonPressable>
  );
};
