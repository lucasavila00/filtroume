import {
  Callout,
  FontIcon,
  IconButton,
  Slider,
  Stack,
} from "office-ui-fabric-react";
import React from "react";
import { IFabricEditingImage } from "../../types";
import { iconClass, sliderStyles, spacerStyle } from "./common";

export const EditGraphicButtons: React.FunctionComponent<{
  editorSize: number;
  onFinishEditing: () => void;
  onDelete: () => void;
  info: IFabricEditingImage;
  onChangeOpacity: (opacity: number) => void;
}> = ({ onDelete, onFinishEditing, editorSize, info, onChangeOpacity }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);
  const fullWidthCalloutStyle = {
    root: { marginLeft: 0, width: "100%", maxWidth: editorSize },
  };

  const renderMenu = () => {
    if (menuOpen) {
      return (
        <Callout
          gapSpace={96 + 16}
          onDismiss={closeMenu}
          styles={fullWidthCalloutStyle}
        >
          <Slider
            min={0}
            max={1}
            value={info.opacity}
            showValue={false}
            onChange={onChangeOpacity}
            styles={sliderStyles}
            step={0.1}
          />
        </Callout>
      );
    }
    return <div />;
  };

  return (
    <Stack horizontal={true} gap="m" verticalAlign="center">
      {renderMenu()}
      <IconButton onClick={openMenu}>
        <FontIcon
          iconName="CheckBoxFill"
          className={iconClass}
          style={{ opacity: 0.61 }}
        />
      </IconButton>
      <div style={spacerStyle} />

      <IconButton onClick={onDelete}>
        <FontIcon iconName="Delete" className={iconClass} />
      </IconButton>
      <IconButton onClick={onFinishEditing}>
        <FontIcon iconName="CheckMark" className={iconClass} />
      </IconButton>
    </Stack>
  );
};
