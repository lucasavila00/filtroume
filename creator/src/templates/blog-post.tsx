import { graphql, Link } from "gatsby";
import { Link as UiLink, Stack, Text } from "office-ui-fabric-react";
import React from "react";
import rehypeReact from "rehype-react";
import Bio from "../components/bio";
import Layout from "../components/layout";
import SEO from "../components/seo";
import "../css/normalize.css";

const RegularText: React.FunctionComponent = ({ children }) => (
  <Text variant="large" block={true}>
    {children}
  </Text>
);

const H1Text: React.FunctionComponent = ({ children }) => (
  <Text variant="mega" block={true}>
    {children}
  </Text>
);

const H2Text: React.FunctionComponent = ({ children }) => (
  <Text variant="xxLarge" block={true}>
    {children}
  </Text>
);

const LiText: React.FunctionComponent = ({ children }) => (
  <Text variant="xLarge" block={true}>
    ○ {children}
  </Text>
);

const SmallText: React.FunctionComponent = ({ children }) => (
  <Text variant="xSmall" block={true}>
    {children}
  </Text>
);

const AstDiv: React.FunctionComponent = ({ children }) => (
  <Stack gap="m">{children}</Stack>
);
const AstUl: React.FunctionComponent = ({ children }) => (
  <Stack gap="m" padding="m">
    {children}
  </Stack>
);
class BlogPostTemplate extends React.Component<{
  data: any;
  location: { pathname: string };
  pageContext: any;
}> {
  public render() {
    const renderAst = new rehypeReact({
      createElement: React.createElement,
      components: {
        h1: H1Text,
        h2: H2Text,
        p: RegularText,
        div: AstDiv,
        ul: AstUl,
        ol: AstUl,
        a: UiLink,
        li: LiText,
        small: SmallText,
      },
    }).Compiler;

    const post = this.props.data.markdownRemark;
    const siteTitle = this.props.data.site.siteMetadata.title;
    const { previous, next } = this.props.pageContext;

    const renderPrevious = () => {
      if (previous == null) {
        return null;
      } else {
        return (
          <UiLink
            as={Link as any}
            {...{ to: previous.fields.slug, rel: "prev" }}
          >
            ← {previous.frontmatter.title}
          </UiLink>
        );
      }
    };

    const renderNext = () => {
      if (next == null) {
        return null;
      } else {
        return (
          <UiLink as={Link as any} {...{ to: next.fields.slug, rel: "next" }}>
            {next.frontmatter.title} →
          </UiLink>
        );
      }
    };
    const renderButtons = () => {
      if (previous == null && next == null) {
        return null;
      } else {
        return (
          <Stack
            as="nav"
            padding="m"
            gap="s1"
            style={{ marginTop: 32, marginBottom: 32 }}
            horizontalAlign="center"
          >
            {renderPrevious()}
            {renderNext()}
          </Stack>
        );
      }
    };

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <Stack as="article" gap="l1">
          <Stack as="header" gap="s1">
            <Text variant="xxLarge">{post.frontmatter.title}</Text>
            <Text>{post.frontmatter.date}</Text>
          </Stack>
          {renderAst(post.htmlAst)}

          <footer style={{ marginTop: 32 }}>
            <Bio />
          </footer>
        </Stack>
        {renderButtons()}
      </Layout>
    );
  }
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      htmlAst
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`;
