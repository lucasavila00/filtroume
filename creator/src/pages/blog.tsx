import { graphql, Link } from "gatsby";
import { Link as UiLink, Stack, Text } from "office-ui-fabric-react";
import React from "react";
import Bio from "../components/bio";
import Layout from "../components/layout";
import SEO from "../components/seo";
import "../css/index.css";
import "../css/normalize.css";
import { rhythm } from "../utils/typography";

class BlogIndex extends React.Component<{
  data: any;
  location: { pathname: string };
}> {
  public render() {
    const { data } = this.props;
    const siteTitle = data.site.siteMetadata.title;
    const posts = data.allMarkdownRemark.edges;

    const renderPosts = () => {
      return posts.map(({ node }: any) => {
        const title = node.frontmatter.title || node.fields.slug;
        const postLinkStyle = {
          root: { boxShadow: `none`, marginBottom: rhythm(1 / 4) },
        };
        const innerHtml = {
          __html: node.frontmatter.description || node.excerpt,
        };
        return (
          <Stack key={node.fields.slug} as="article" gap="m" padding="m">
            <Stack as="header">
              <UiLink
                as={Link as any}
                {...{ to: node.fields.slug }}
                styles={postLinkStyle}
              >
                {title}
              </UiLink>
              <Text variant="small">{node.frontmatter.date}</Text>
            </Stack>
            <Stack as="section">
              <Text>
                <span dangerouslySetInnerHTML={innerHtml} />
              </Text>
            </Stack>
          </Stack>
        );
      });
    };
    return (
      <>
        <SEO title="Blog" />
        <Layout location={this.props.location} title={siteTitle}>
          <Stack gap="l2" horizontalAlign="start">
            <Bio />
            {renderPosts()}
          </Stack>
        </Layout>
      </>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`;
