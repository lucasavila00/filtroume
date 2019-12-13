import React, { useState } from "react"
import ReactDOM from "react-dom"
import {
  Text,
  Stack,
  Persona,
  PersonaInitialsColor,
  PersonaSize,
  PersonaPresence,
  Link,
  Button,
  PrimaryButton,
  DefaultButton,
  Dropdown,
  ResponsiveMode,
  IDropdownOption,
  IconButton,
  IDropdownProps,
  Icon,
} from "office-ui-fabric-react"
import { FontIcon } from "office-ui-fabric-react/lib/Icon"
import { mergeStyles, mergeStyleSets } from "office-ui-fabric-react/lib/Styling"

const iconClass = mergeStyles({
  fontSize: 24,
  height: 24,
  width: 24,
})

const classNames = mergeStyleSets({
  changeColorIcon: [{ color: "deepskyblue" }, iconClass],
})

import useDimensions from "react-use-dimensions"
import { fabric } from "fabric"
enum FabricEditingTypes {
  none,
  text,
  image,
}

interface FabricEditingNone {
  type: FabricEditingTypes.none
}

interface FabricEditingText {
  type: FabricEditingTypes.text
  color: string | fabric.Pattern | fabric.Gradient
}

const makeEditingNone = (): FabricEditingNone => ({
  type: FabricEditingTypes.none,
})

type FabricEditing = FabricEditingNone | FabricEditingText
const CANVAS_KEY = "_fabric_canvas"
const castedCanvas = () => (window as any)[CANVAS_KEY] as fabric.Canvas
const registerCanvasOnWindow = (canvas: fabric.Canvas) => {
  ;(window as any)[CANVAS_KEY] = canvas
}
const addNewText = (canvasSize: number) => {
  const defaultFontSize = 36
  const canvas = castedCanvas()

  canvas.add(
    new fabric.IText("Sample Text", {
      top: canvasSize / 3,
      left: canvasSize / 3,
      fontSize: defaultFontSize,
      textAlign: "center",
      fontFamily: "sans-serif",
      fill: "red",
    })
  )
  canvas.setActiveObject(canvas.getObjects()[0])

  // when we are done makeing changes send the state from fabric
  canvas.fire("saveData", {})
}

const changeActiveTextColor = (color: string) => {
  const canvas = castedCanvas()
  const obj = canvas.getActiveObject()

  if (obj == null || obj == undefined) {
    return
  }

  if (obj.isType("i-text")) {
    const textobj = obj as fabric.IText
    textobj.set("fill", color)
    canvas.fire("saveData", {})
  }
}
// const changeActiveTextFontSize = (fontSize: number) => {
//   const canvas = castedCanvas()
//   const obj = canvas.getActiveObject()

//   if (obj == null || obj == undefined) {
//     return
//   }

//   if (obj.isType("i-text")) {
//     const textobj = obj as fabric.IText
//     textobj.fontSize = fontSize
//     canvas.fire("saveData", {})
//   }
//   // if (active )
// }
const unfocusOnCanvas = () => {
  const canvas = castedCanvas()
  canvas.discardActiveObject()
  canvas.fire("saveData", {})
}
const getEditing = (obj: fabric.Object): FabricEditing => {
  if (obj == null || obj == undefined) {
    return makeEditingNone()
  }

  if (obj.isType("i-text")) {
    const textobj = obj as fabric.IText
    console.log({ obj })
    return {
      type: FabricEditingTypes.text,
      color: textobj.fill,
    }
  }
  return makeEditingNone()
}
class CanvasEditor extends React.Component<{
  size: number
  changeData: (data: any) => void
  changeEditing: (editing: FabricEditing) => void
}> {
  public componentDidMount() {
    var el = ReactDOM.findDOMNode(this)
    var canvas = new fabric.Canvas(el)
    registerCanvasOnWindow(canvas)
    const { size, changeData, changeEditing } = this.props
    canvas.selection = false
    canvas.setDimensions({ width: size, height: size })

    // // on mouse up lets save some state
    canvas.on("mouse:up", () => {
      changeData(canvas.toObject())
      changeEditing(getEditing(canvas.getActiveObject()))
    })

    // // an event we will fire when we want to save state
    canvas.on("saveData", () => {
      changeData(canvas.toObject())
      changeEditing(getEditing(canvas.getActiveObject()))
      canvas.renderAll() // programatic changes we make will not trigger a render in fabric
    })
  }

  public render() {
    return <canvas></canvas>
  }
}

const InsertButtons: React.FunctionComponent<{ size: number }> = ({ size }) => {
  return (
    <Stack horizontal gap="s1" verticalAlign="center">
      <DefaultButton onClick={() => addNewText(size)}>+ Text</DefaultButton>
      <DefaultButton>+ Image</DefaultButton>
    </Stack>
  )
}
const capText = (text: string): string => {
  const CAP_LIMIT = 8
  const LIMITER = "..."

  if (text.length <= CAP_LIMIT) {
    return text
  } else {
    return text.substr(0, CAP_LIMIT - LIMITER.length) + LIMITER
  }
}
const EditTextButtons: React.FunctionComponent<{
  size: number
  info: FabricEditingText
  changeEditing: (editing: FabricEditing) => void
}> = ({ size, info, changeEditing }) => {
  const [selectedKey, changeSelectedKey] = useState<string>("" + info.color)
  const _onRenderOption = (option: IDropdownOption): JSX.Element => {
    return (
      <div>
        <span style={{ color: "" + option.key, fontWeight: "bold" }}>
          {option.text}
        </span>
      </div>
    )
  }
  const _onRenderTitle = (options: IDropdownOption[]): JSX.Element => {
    const option = options[0]

    return (
      <div>
        <span style={{ color: "" + option.key, fontWeight: "bold" }}>
          {option.text}
        </span>
      </div>
    )
  }
  return (
    <Stack
      horizontal
      gap="m"
      verticalAlign="center"
      style={{
        flexShrink: 0,
      }}
      styles={{
        root: { overflowX: "auto", overflowY: "hidden" },
      }}
    >
      <Stack horizontal gap="s1" verticalAlign="center">
        <FontIcon
          iconName="FontColorA"
          className={classNames.changeColorIcon}
        />
        <Dropdown
          options={[
            { key: "black", text: "Black" },
            { key: "red", text: "Red" },
            { key: "green", text: "Green" },
            { key: "blue", text: "Blue" },
          ]}
          selectedKey={selectedKey}
          responsiveMode={ResponsiveMode.large}
          //   styles={{
          //     title: { backgroundColor: selectedKey },
          //   }}
          //   onRenderTitle={() => <div style={{ width: 48 }} />}
          onChange={(_, item) => {
            changeSelectedKey("" + item.key)
            changeActiveTextColor("" + item.key)
          }}
          onRenderOption={_onRenderOption}
          onRenderTitle={_onRenderTitle}
        ></Dropdown>
      </Stack>

      <Stack horizontal gap="s1" verticalAlign="center">
        <FontIcon iconName="Font" className={iconClass} />
        <Dropdown
          options={[
            { key: "Times New Roman", text: "Times New Roman" },
          ].map(x => ({ ...x, text: capText(x.text) }))}
          selectedKey="Times New Roman"
          responsiveMode={ResponsiveMode.large}
        ></Dropdown>
      </Stack>

      <div
        style={{
          display: "flex",
          flexGrow: 1,
        }}
      />
      <IconButton>
        <FontIcon iconName="Delete" className={iconClass} />
      </IconButton>
      <IconButton
        onClick={() => {
          changeEditing(makeEditingNone())
          unfocusOnCanvas()
        }}
      >
        <FontIcon iconName="CheckMark" className={iconClass} />
      </IconButton>
    </Stack>
  )
}

const EditImageButtons: React.FunctionComponent<{ size: number }> = ({
  size,
}) => {
  return (
    <Stack horizontal gap="s1" verticalAlign="center">
      <DefaultButton>Edit image</DefaultButton>
    </Stack>
  )
}

const ImageEditor: React.FunctionComponent<{ onDone: () => void }> = ({
  onDone,
}) => {
  const [ref, { width }] = useDimensions()
  const [fabricEditing, changeFabricEditing] = useState({
    type: FabricEditingTypes.none,
  })
  return (
    <>
      <Stack horizontal gap="m" horizontalAlign="end" verticalAlign="center">
        <PrimaryButton
          onClick={() => {
            // if (fabricEditing.type === FabricEditingTypes.none) {
            onDone()
            // } else {
            //   changeFabricEditing(makeEditingNone())
            //   unfocusOnCanvas()
            // }
          }}
        >
          Save
        </PrimaryButton>
      </Stack>
      <Stack verticalFill gap="m">
        {fabricEditing.type === FabricEditingTypes.none ? (
          <InsertButtons size={width} />
        ) : fabricEditing.type === FabricEditingTypes.text ? (
          <EditTextButtons
            size={width}
            info={fabricEditing as FabricEditingText}
            changeEditing={changeFabricEditing}
          />
        ) : (
          <EditImageButtons size={width} />
        )}
        <div
          style={{
            width: "100%",
          }}
          ref={ref}
        >
          {width && (
            <div
              style={{
                width,
                height: width,
                borderColor: "rgba(0, 0, 0, 0.09)",
                borderStyle: "solid",
                borderWidth: 2,
              }}
            >
              <CanvasEditor
                size={width}
                changeData={console.warn}
                changeEditing={changeFabricEditing}
              ></CanvasEditor>
            </div>
          )}
        </div>
      </Stack>
    </>
  )
}

const DefaultEditor: React.FunctionComponent<{
  onEditImage: () => void
}> = ({ onEditImage }) => {
  return (
    <>
      <Stack
        horizontal
        gap="m"
        horizontalAlign="space-between"
        verticalAlign="center"
      >
        <Link href="/">Filtre.me</Link>
        <Stack horizontal gap="s1">
          <Button href="asdasd">Preview</Button>
          <PrimaryButton href="asdasd">Publish</PrimaryButton>
        </Stack>
      </Stack>

      <Stack
        verticalFill
        verticalAlign="space-between"
        horizontalAlign="center"
        styles={{
          root: {
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundImage:
              "url(https://static2.sharepointonline.com/files/fabric/office-ui-fabric-react-assets/persona-female.png)",
          },
        }}
      >
        <Stack
          styles={{
            root: {
              height: "20vh",
              width: "20vh",
              backgroundColor: "rgba(255, 255, 255, 0.61)",
            },
          }}
        >
          <Button onClick={onEditImage}>Image a</Button>
        </Stack>
        <Stack
          styles={{
            root: {
              height: "20vh",
              width: "20vh",
              backgroundColor: "rgba(255, 255, 255, 0.61)",
            },
          }}
        >
          <Button>Image b</Button>
        </Stack>
      </Stack>
      <Stack>
        <Text variant="xLarge" styles={{ root: { marginBottom: 16 } }}>
          Color filter
        </Text>
        <Stack
          horizontal
          gap="m"
          styles={{ root: { overflowX: "scroll", overflowY: "hidden" } }}
        >
          {[1, 1, 1, 1, 1].map((_, index) => {
            return (
              <Persona
                key={index}
                initialsColor={PersonaInitialsColor.blue}
                size={PersonaSize.large}
                presence={
                  index == 0 ? PersonaPresence.online : PersonaPresence.none
                }
                imageUrl="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-react-assets/persona-female.png"
                text=""
                hidePersonaDetails
              />
            )
          })}
        </Stack>
      </Stack>
    </>
  )
}

const Create: React.FunctionComponent = () => {
  const [editing, changeEditing] = React.useState(true)

  return (
    <>
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Stack
          verticalFill
          verticalAlign="space-between"
          padding="s1"
          styles={{ root: { maxHeight: "99vh", maxWidth: 720, width: "100%" } }}
          gap="s1"
        >
          {editing ? (
            <ImageEditor onDone={() => changeEditing(false)} />
          ) : (
            <DefaultEditor onEditImage={() => changeEditing(true)} />
          )}
        </Stack>
      </div>
    </>
  )
}

export default Create
