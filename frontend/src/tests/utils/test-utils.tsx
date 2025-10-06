import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import type { ReactElement, ReactNode } from "react";
import "@testing-library/jest-dom";

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
