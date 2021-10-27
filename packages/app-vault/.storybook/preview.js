import "../src/index.css";
import "./storybook.css";
import { addDecorator } from "@storybook/react";
import { withInfo } from "@storybook/addon-info";
import { withKnobs } from "@storybook/addon-knobs";
import { MemoryRouter } from "react-router";

addDecorator(withInfo);
addDecorator(withKnobs);
addDecorator(story => <MemoryRouter initialEntries={['/']}>{story()}</MemoryRouter>);
