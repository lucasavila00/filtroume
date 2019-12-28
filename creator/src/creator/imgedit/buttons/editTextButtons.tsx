import {
  Callout,
  DefaultButton,
  FontIcon,
  IComponentStyles,
  IconButton,
  IStackSlots,
  Slider,
  Stack,
  SwatchColorPicker,
} from "office-ui-fabric-react";
import React from "react";
import { colors, fonts } from "../../contants";
import { IFabricEditingText } from "../../types";
import { iconClass, sliderStyles, spacerStyle } from "./common";
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
            gapSpace={96 + 16}
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
                <SliderWrapper
                  min={0}
                  max={2}
                  value={info.strokeWidth}
                  onChangeValue={changeStrokeWidth}
                />
              );
            }
            case SliderType.shadow: {
              return (
                <SliderWrapper
                  min={0}
                  max={32}
                  value={info.shadowSize}
                  onChangeValue={changeShadowSize}
                />
              );
            }
          }
        };

        return (
          <Callout
            gapSpace={96 + 16}
            onDismiss={closeMenus}
            styles={fullWidthCalloutStyle}
          >
            {renderSlider()}
          </Callout>
        );
      }

      case MenuTypesKind.FontSelect: {
        const onChangeFont = (f: string): void => {
          closeMenus();
          changeFont(f);
        };
        return (
          <Callout
            gapSpace={96 + 16}
            onDismiss={closeMenus}
            styles={fullWidthCalloutStyle}
          >
            <FontPicker changeFont={onChangeFont} />
          </Callout>
        );
      }
    }
  };
  const safeColor = (color: string): string => {
    if (color === "#ffffff" || color === "white") {
      return "#aaa";
    }
    return color;
  };
  return (
    <>
      <HackedHorizontalScrollingStack>
        <IconButton onClick={openTextColorMenu}>
          {renderMenu()}
          <FontIcon
            iconName="FontColor"
            className={iconClass}
            style={{ color: safeColor(info.color) }}
          />
        </IconButton>

        <IconButton onClick={openFontMenu}>
          <FontIcon iconName="Font" className={iconClass} />
        </IconButton>

        <IconButton onClick={openStrokeColorMenu}>
          <FontIcon
            iconName="BorderDash"
            className={iconClass}
            style={{ color: safeColor(info.strokeColor) }}
          />
        </IconButton>
        <IconButton onClick={openStrokeSizeMenu}>
          <FontIcon iconName="BorderDot" className={iconClass} />
        </IconButton>

        <IconButton onClick={openShadowColorMenu}>
          <FontIcon
            iconName="CheckBoxFill"
            className={iconClass}
            style={{ color: safeColor(info.shadowColor) }}
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
      colorCells={colors}
    />
  );
};

const SliderWrapper: React.FunctionComponent<{
  value: number;
  onChangeValue: (value: number) => void;
  min: number;
  max: number;
}> = ({ onChangeValue, value, min, max }) => {
  return (
    <Slider
      min={min}
      max={max}
      value={value}
      showValue={false}
      onChange={onChangeValue}
      styles={sliderStyles}
      step={(max - min) / 16}
    />
  );
};

const FontPicker: React.FunctionComponent<{
  changeFont: (font: string) => void;
}> = ({ changeFont }) => {
  const renderItems = () => {
    return fonts.map((f) => {
      const onChangeFont = () => changeFont(f);
      return (
        <DefaultButton key={f} style={{ fontFamily: f }} onClick={onChangeFont}>
          {f}
        </DefaultButton>
      );
    });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {renderItems()}
    </div>
  );
};

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
