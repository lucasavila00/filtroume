import {
  Dropdown,
  FontIcon,
  IComponentStyles,
  IconButton,
  IDropdownOption,
  IStackSlots,
  mergeStyles,
  mergeStyleSets,
  ResponsiveMode,
  Stack,
} from "office-ui-fabric-react";
import React, { useState } from "react";
import { FabricEditing, IFabricEditingText } from "../types";
import {
  capText,
  changeActiveTextColor,
  makeEditingNone,
  unfocusOnCanvas,
} from "./helpers";

const iconClass = mergeStyles({
  fontSize: 24,
  height: 24,
  width: 24,
});

const classNames = mergeStyleSets({
  changeColorIcon: [{ color: "deepskyblue" }, iconClass],
});

const HackedHorizontalScrollingStack: React.FunctionComponent = ({
  children,
}) => {
  const hackStyle = {
    flexShrink: 0,
  };
  const hackStyles: IComponentStyles<IStackSlots> = {
    root: { overflowX: "auto", overflowY: "hidden" },
  };
  return (
    <Stack
      horizontal={true}
      gap="m"
      verticalAlign="center"
      style={hackStyle}
      styles={hackStyles}
    >
      {children}
    </Stack>
  );
};

export const EditTextButtons: React.FunctionComponent<{
  size: number;
  info: IFabricEditingText;
  changeEditing: (editing: FabricEditing) => void;
}> = ({ info, changeEditing }) => {
  const [selectedKey, changeSelectedKey] = useState<string>("" + info.color);

  const onRenderOption = (option?: IDropdownOption): JSX.Element => {
    if (option == null) {
      return <div />;
    }
    return (
      <div>
        <span style={{ color: "" + option.key, fontWeight: "bold" }}>
          {option.text}
        </span>
      </div>
    );
  };
  const onRenderTitle = (options?: IDropdownOption[]): JSX.Element => {
    if (options == null) {
      return <div />;
    }
    const option = options[0];

    return (
      <div>
        <span style={{ color: "" + option.key, fontWeight: "bold" }}>
          {option.text}
        </span>
      </div>
    );
  };
  const colorOptions = [
    { key: "black", text: "Black" },
    { key: "red", text: "Red" },
    { key: "green", text: "Green" },
    { key: "blue", text: "Blue" },
  ];
  const onColorSelected = (
    _: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption | undefined,
  ): void => {
    if (item) {
      changeSelectedKey("" + item.key);
      changeActiveTextColor("" + item.key);
    }
  };
  const fontOptions = [
    { key: "Times New Roman", text: "Times New Roman" },
  ].map((x) => ({ ...x, text: capText(x.text) }));
  const spacerStyle = {
    display: "flex",
    flexGrow: 1,
  };
  const onFinishEditing = () => {
    changeEditing(makeEditingNone());
    unfocusOnCanvas();
  };
  return (
    <HackedHorizontalScrollingStack>
      <Stack horizontal={true} gap="s1" verticalAlign="center">
        <FontIcon
          iconName="FontColorA"
          className={classNames.changeColorIcon}
        />
        <Dropdown
          options={colorOptions}
          selectedKey={selectedKey}
          responsiveMode={ResponsiveMode.large}
          onChange={onColorSelected}
          onRenderOption={onRenderOption}
          onRenderTitle={onRenderTitle}
        />
      </Stack>

      <Stack horizontal={true} gap="s1" verticalAlign="center">
        <FontIcon iconName="Font" className={iconClass} />
        <Dropdown
          options={fontOptions}
          selectedKey="Times New Roman"
          responsiveMode={ResponsiveMode.large}
        />
      </Stack>

      <div style={spacerStyle} />
      <IconButton>
        <FontIcon iconName="Delete" className={iconClass} />
      </IconButton>
      <IconButton onClick={onFinishEditing}>
        <FontIcon iconName="CheckMark" className={iconClass} />
      </IconButton>
    </HackedHorizontalScrollingStack>
  );
};
