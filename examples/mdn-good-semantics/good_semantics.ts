import type { ElementSpecType } from "../../src/contracts/element_spec.ts";
import type { SemanticNodeType } from "../../src/contracts/semantic_node.ts";

function leaf(tag: string, text: string): ElementSpecType {
  return { tag, attrs: {}, text, children: [] };
}

export const goodSemanticsElementSpec: ElementSpecType = {
  tag: "article",
  attrs: {},
  children: [
    leaf("h1", "A study of chickens"),
    leaf(
      "p",
      "The chicken (Gallus gallus domesticus) is a domesticated bird, with attributes of wild species such as the red and grey junglefowl that are originally from Southeastern Asia.",
    ),
    leaf(
      "p",
      "As a species, chickens are a common food source and in 2017, the global population exceeded 50 billion. A large number of chickens in the world are kept in factory farms.",
    ),
    leaf(
      "p",
      "While domesticated chickens are recognised as a subspecies of the red junglefowl, some argue that the domestic chicken should be classified as a distinct species.",
    ),
    leaf(
      "p",
      "The hen is the female, and the rooster the male. Young chickens are called chicks and are highly social animals. A group of chickens is called a flock.",
    ),
    leaf(
      "p",
      "The chicken is thought to have been domesticated in the past 7,000 years and their organs have been shown to have a high level of antibiotic resistance.",
    ),
    leaf("h2", "Other uses of chickens"),
    leaf(
      "p",
      "Chicken eggs are a common food, and feathers have been used for decoration and as stuffing.",
    ),
    leaf(
      "p",
      "Cockerels can be used for fighting in some cultures, and in others the image of a rooster is associated with courage and pride.",
    ),
    leaf("h2", "Reproduction and life-cycle"),
    leaf(
      "p",
      "Hens typically lay eggs that are incubated for about 21 days until they hatch. The chicks are able to walk and follow the hen shortly after hatching.",
    ),
  ],
};

export const goodSemanticsSemanticNode: SemanticNodeType = {
  type: "article",
  role: "article",
  props: {},
  children: [
    { type: "h1", name: "A study of chickens", props: {}, children: [] },
    {
      type: "p",
      name:
        "The chicken (Gallus gallus domesticus) is a domesticated bird, with attributes of wild species such as the red and grey junglefowl that are originally from Southeastern Asia.",
      props: {},
      children: [],
    },
    {
      type: "p",
      name:
        "As a species, chickens are a common food source and in 2017, the global population exceeded 50 billion. A large number of chickens in the world are kept in factory farms.",
      props: {},
      children: [],
    },
    {
      type: "p",
      name:
        "While domesticated chickens are recognised as a subspecies of the red junglefowl, some argue that the domestic chicken should be classified as a distinct species.",
      props: {},
      children: [],
    },
    {
      type: "p",
      name:
        "The hen is the female, and the rooster the male. Young chickens are called chicks and are highly social animals. A group of chickens is called a flock.",
      props: {},
      children: [],
    },
    {
      type: "p",
      name:
        "The chicken is thought to have been domesticated in the past 7,000 years and their organs have been shown to have a high level of antibiotic resistance.",
      props: {},
      children: [],
    },
    { type: "h2", name: "Other uses of chickens", props: {}, children: [] },
    {
      type: "p",
      name:
        "Chicken eggs are a common food, and feathers have been used for decoration and as stuffing.",
      props: {},
      children: [],
    },
    {
      type: "p",
      name:
        "Cockerels can be used for fighting in some cultures, and in others the image of a rooster is associated with courage and pride.",
      props: {},
      children: [],
    },
    {
      type: "h2",
      name: "Reproduction and life-cycle",
      props: {},
      children: [],
    },
    {
      type: "p",
      name:
        "Hens typically lay eggs that are incubated for about 21 days until they hatch. The chicks are able to walk and follow the hen shortly after hatching.",
      props: {},
      children: [],
    },
  ],
};
