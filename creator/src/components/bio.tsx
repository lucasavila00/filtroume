/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import { graphql, useStaticQuery } from "gatsby";
import Image from "gatsby-image";
import { Link, Stack, Text } from "office-ui-fabric-react";
import React from "react";
import { rhythm } from "../utils/typography";

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profilepic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author
          social {
            twitter
          }
        }
      }
    }
  `);

  const { author } = data.site.siteMetadata;

  const imageWrapperStyle = {
    marginRight: rhythm(1 / 2),
    marginBottom: 0,
    minWidth: 50,
    borderRadius: `100%`,
  };
  const imageWrapper = {
    borderRadius: `50%`,
  };
  return (
    <Stack
      horizontalAlign="start"
      verticalAlign="center"
      gap="s1"
      horizontal={true}
    >
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author}
        style={imageWrapperStyle}
        imgStyle={imageWrapper}
      />
      <Stack horizontalAlign="start">
        <Text variant="large">
          Written by <strong>{author}</strong>
        </Text>
        <Text variant="large">
          He types on the keyboard and sometimes clicks the mouse.
        </Text>
        <Link href="https://twitter.com/lucasavila00">
          Get in touch via Twitter
        </Link>
      </Stack>
    </Stack>
  );
};

export default Bio;
