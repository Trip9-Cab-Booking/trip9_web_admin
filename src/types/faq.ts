export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type FAQ = {
  id: string;
  title: string;
  audience: "user" | "driver" | "both";
  items: FAQItem[];
};
