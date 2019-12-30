import { Link } from "gatsby";
import {
  ILinkStyleProps,
  ILinkStyles,
  IStyleFunctionOrObject,
  Link as UiLink,
  Stack,
} from "office-ui-fabric-react";
import React from "react";
import "../css/common.css";
import "../css/normalize.css";
import { rhythm } from "../utils/typography";

class Layout extends React.Component<{
  location: { pathname: string };
  title: string;
}> {
  public render() {
    const { title, children } = this.props;

    const headerStyle: IStyleFunctionOrObject<ILinkStyleProps, ILinkStyles> = {
      root: {
        fontSize: 24,
        fontWeight: 600,
      },
    };
    const header = (
      <UiLink as={Link as any} {...{ to: "/blog" }} styles={headerStyle}>
        {title} techs
      </UiLink>
    );

    const wrapperStyle = {
      root: {
        marginLeft: `auto`,
        marginRight: `auto`,
        maxWidth: rhythm(24),
        marginTop: rhythm(2.5),
      },
    };
    return (
      <Stack
        horizontalAlign="start"
        verticalAlign="start"
        verticalFill={true}
        gap="l2"
        styles={wrapperStyle}
      >
        <header>{header}</header>
        <main>{children}</main>
      </Stack>
    );
  }
}

export default Layout;
