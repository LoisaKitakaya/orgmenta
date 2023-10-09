export const arrayDeclarationTypes: {
  id: string;
  declaration_type: string;
  prefix: string;
  description: string;
  notes: string;
  rule: string;
}[] = [  
  {
    id: "todo",
    declaration_type: "hook",
    prefix: "use",
    description: "React Hook",
    notes: "Hooks must start with 'use' (lowercase)",
    rule: "",
  },
  {
    id: "todo",
    declaration_type: "remote data request",
    prefix: "use",
    description: "React Hook",
    notes: "Remote data requests must start with 'request' (lowercase)",
    rule: "",
  },
  {
    id: "todo",
    declaration_type: "component",
    prefix: "View", // Maybe change to 'Component'? As view is used in other parlance.
    description: "React native components",
    notes: "React native components must start with 'View' (uppercase V)",
    rule: "Must be function arrow components. Maybe change to 'Component'? As view is used in other parlance",
  },
  {
    id: "todo",
    declaration_type: "validation",
    prefix: "validate",
    description: "React Utility Package with at least one method",
    notes: "validation functions must start with 'validate' (lowercase)",
    rule: "",
  },
  {
    id: "todo",
    declaration_type: "type",
    prefix: "Type",
    description: "React Utility Package with at least one method",
    notes: "types must start with 'Type' (uppercase T)",
    rule: "",
  },
  {
    id: "todo",
    declaration_type: "execute",
    prefix: "Execute",
    description: "React Utility Package with at least one method",
    notes:
      "react-specific utility functions that perform an action must start with 'Execute' (uppercase E)",
    rule: "",
  },
  {
    id: "todo",
    declaration_type: "utility",
    prefix: "Utility",
    description: "React Utility Package with at least one method",
    notes:
      "react-specific utility objects that have a method must start with 'Utility' (uppercase U)",
    rule: "",
  },
  {
    id: "todo",
    declaration_type: "synchronous",
    prefix: "do",
    description: "React Utility Package with at least one method",
    notes:
      "General synchronous functions must start with 'do' (lowercase). See crypto.tsx for examples.",
    rule: "",
  },
  {
    id: "todo",
    declaration_type: "asynchronous",
    prefix: "async",
    description: "React Utility Package with at least one method",
    notes:
      "General async functions must start with 'async' (lowercase). See crypto.tsx for examples.",
    rule: "",
  },
  {
    id: "todo",
    declaration_type: "array",
    prefix: "array",
    description: "",
    notes: "",
    rule: "",
  },
  {
    id: "todo",
    declaration_type: "object",
    prefix: "object",
    description: "",
    notes: "",
    rule: "",
  },
];
