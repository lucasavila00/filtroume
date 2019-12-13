import {
  Callout,
  FontIcon,
  IComponentStyles,
  IconButton,
  IStackSlots,
  mergeStyles,
  Stack,
  SwatchColorPicker,
} from "office-ui-fabric-react";
import React from "react";
import { IFabricEditingText } from "../types";

const iconClass = mergeStyles({
  fontSize: 24,
  height: 24,
  width: 24,
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

const HackyColorButton: React.FunctionComponent<{
  openMenu: () => void;
  color: string;
}> = ({ openMenu, color }) => {
  const colorButtonSwatchStyle = {
    focusedContainer: { minWidth: 24 },
    tableCell: { padding: 0 },
  };
  return (
    <SwatchColorPicker
      isControlled={true}
      columnCount={1}
      cellHeight={24}
      cellWidth={24}
      cellBorderWidth={0}
      selectedId={"e"}
      cellShape={"circle"}
      colorCells={[{ id: "e", color }]}
      styles={colorButtonSwatchStyle}
      onCellFocused={openMenu}
      onCellHovered={openMenu}
    />
  );
};

const spacerStyle = {
  display: "flex",
  flexGrow: 1,
};

enum MenuTypesKind {
  None,
  ColorSwatch,
  Slider,
  FontSelect,
}
enum ColorType {
  text,
  shadow,
  stroke,
}
enum SliderType {
  shadow,
  stroke,
}
interface IMenuTypeNone {
  kind: MenuTypesKind.None;
}
interface IMenuTypeSlider {
  kind: MenuTypesKind.Slider;
  sliderType: SliderType;
}
interface IMenuTypeFontSelect {
  kind: MenuTypesKind.FontSelect;
}

interface IMenuTypeColorSwatch {
  kind: MenuTypesKind.ColorSwatch;
  colorType: ColorType;
}

type MenuType =
  | IMenuTypeNone
  | IMenuTypeColorSwatch
  | IMenuTypeSlider
  | IMenuTypeFontSelect;

const generateMenuNone = (): IMenuTypeNone => ({ kind: MenuTypesKind.None });

const colorCellsExample2 = [
  { id: "a", label: "red", color: "#a4262c" },
  { id: "b", label: "orange", color: "#ca5010" },
  { id: "c", label: "orangeYellow", color: "#986f0b" },
  { id: "d", label: "white", color: "#ffffff" },
  { id: "e", label: "green", color: "#0b6a0b" },
  { id: "f", label: "cyan", color: "#038387" },
  { id: "g", label: "cyanBlue", color: "#004e8c" },
  { id: "h", label: "magenta", color: "#881798" },
  { id: "i", label: "magentaPink", color: "#9b0062" },
  { id: "j", label: "black", color: "#000000" },
  { id: "k", label: "gray", color: "#7a7574" },
  { id: "l", label: "gray20", color: "#69797e" },
];
const ColorPicker: React.FunctionComponent<{
  selectColor: (color: string, type: ColorType) => void;
  type: ColorType;
}> = ({ selectColor, type }) => {
  const onColorSelected = (
    _: string | undefined,
    color: string | undefined,
  ): void => {
    if (color != null) {
      selectColor(color, type);
    }
  };
  return (
    <SwatchColorPicker
      onCellFocused={onColorSelected}
      columnCount={4}
      cellShape={"circle"}
      cellHeight={32}
      cellWidth={32}
      cellBorderWidth={4}
      colorCells={colorCellsExample2}
    />
  );
};

const Slider: React.FunctionComponent<{
  value: number;
  onChangeValue: (value: number) => void;
}> = () => {
  return <div />;
};

const FontPicker: React.FunctionComponent<{
  changeFont: (font: string) => void;
}> = () => {
  return <div />;
};

export const EditTextButtons: React.FunctionComponent<{
  editorSize: number;
  info: IFabricEditingText;
  finishEditing: () => void;
  changeColor: (color: string) => void;
  changeFont: (font: string) => void;
  changeStrokeColor: (color: string) => void;
  changeStrokeWidth: (width: number) => void;
  changeShadowColor: (color: string) => void;
  changeShadowSize: (size: number) => void;
  deleteText: () => void;
}> = ({
  finishEditing,
  changeColor,
  info,
  deleteText,
  changeStrokeColor,
  changeShadowColor,
  changeStrokeWidth,
  changeShadowSize,
  changeFont,
  editorSize,
}) => {
  const [menu, changeMenu] = React.useState<MenuType>(generateMenuNone());

  const openColorSwatchMenu = (colorType: ColorType) => {
    changeMenu({
      kind: MenuTypesKind.ColorSwatch,
      colorType,
    });
  };

  const openTextColorMenu = () => openColorSwatchMenu(ColorType.text);
  const openShadowColorMenu = () => openColorSwatchMenu(ColorType.shadow);
  const openStrokeColorMenu = () => openColorSwatchMenu(ColorType.stroke);

  const openSliderMenu = (sliderType: SliderType) => {
    changeMenu({
      kind: MenuTypesKind.Slider,
      sliderType,
    });
  };

  const openShadowSizeMenu = () => openSliderMenu(SliderType.shadow);
  const openStrokeSizeMenu = () => openSliderMenu(SliderType.stroke);

  const openFontMenu = () => changeMenu({ kind: MenuTypesKind.FontSelect });

  const closeMenus = () => changeMenu(generateMenuNone());

  const selectColor = (color: string, type: ColorType) => {
    if (type === ColorType.text) {
      changeColor(color);
    }
    if (type === ColorType.stroke) {
      changeStrokeColor(color);
    }
    if (type === ColorType.shadow) {
      changeShadowColor(color);
    }
    closeMenus();
  };

  const renderMenu = () => {
    const fullWidthCalloutStyle = {
      root: { marginLeft: 0, width: "100%", maxWidth: editorSize },
    };
    switch (menu.kind) {
      case MenuTypesKind.None: {
        return <div />;
      }
      case MenuTypesKind.ColorSwatch: {
        const marginFromType = (type: ColorType): number => {
          switch (type) {
            case ColorType.text: {
              return 0;
            }
            case ColorType.stroke: {
              return 96;
            }

            case ColorType.shadow: {
              return 96 * 2;
            }
          }
        };
        return (
          <Callout
            gapSpace={32}
            onDismiss={closeMenus}
            styles={{ root: { marginLeft: marginFromType(menu.colorType) } }}
          >
            <ColorPicker selectColor={selectColor} type={menu.colorType} />
          </Callout>
        );
      }

      case MenuTypesKind.Slider: {
        const renderSlider = () => {
          switch (menu.sliderType) {
            case SliderType.stroke: {
              return (
                <Slider
                  value={info.strokeWidth}
                  onChangeValue={changeStrokeWidth}
                />
              );
            }
            case SliderType.shadow: {
              return (
                <Slider
                  value={info.shadowSize}
                  onChangeValue={changeShadowSize}
                />
              );
            }
          }
        };

        return (
          <Callout
            gapSpace={32}
            onDismiss={closeMenus}
            styles={fullWidthCalloutStyle}
          >
            {renderSlider()}
          </Callout>
        );
      }

      case MenuTypesKind.FontSelect: {
        return (
          <Callout
            gapSpace={32}
            onDismiss={closeMenus}
            styles={fullWidthCalloutStyle}
          >
            <FontPicker changeFont={changeFont} />
          </Callout>
        );
      }
    }
  };

  return (
    <>
      {renderMenu()}
      <HackedHorizontalScrollingStack>
        <HackyColorButton color={info.color} openMenu={openTextColorMenu} />
        <IconButton onClick={openFontMenu}>
          <FontIcon iconName="Font" className={iconClass} />
        </IconButton>

        <IconButton onClick={openStrokeColorMenu}>
          <FontIcon
            iconName="BorderDash"
            className={iconClass}
            style={{ color: info.strokeColor }}
          />
        </IconButton>
        <IconButton onClick={openStrokeSizeMenu}>
          <FontIcon iconName="BorderDot" className={iconClass} />
        </IconButton>

        <IconButton onClick={openShadowColorMenu}>
          <FontIcon
            iconName="CheckBoxFill"
            className={iconClass}
            style={{ color: info.shadowColor }}
          />
        </IconButton>
        <IconButton onClick={openShadowSizeMenu}>
          <FontIcon iconName="EyeShadow" className={iconClass} />
        </IconButton>

        <div style={spacerStyle} />
        <IconButton onClick={deleteText}>
          <FontIcon iconName="Delete" className={iconClass} />
        </IconButton>
        <IconButton onClick={finishEditing}>
          <FontIcon iconName="CheckMark" className={iconClass} />
        </IconButton>
      </HackedHorizontalScrollingStack>
    </>
  );
};
