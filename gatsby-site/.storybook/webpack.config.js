const { execSync } = require("child_process");
const { dirname, join } = require("path");

module.exports = (baseConfig, env, config) => {
    // Teach Storybook how to import and compile TypeScript:
    config.module.rules.push({
        test: /\.(ts|tsx)$/,
        use: [require.resolve("awesome-typescript-loader")],
    });

    config.resolve.extensions.push(".ts", ".tsx");

    // Patch the built-in css-loader configuration to enable CSS modules.
    config.module.rules[2].use[1].options = {
        ...config.module.rules[2].use[1].options,
        modules: true,
        camelCase: true,
        sourceMap: true,
    };

    // Copy gatsby/cache-dir/pages.json into gatsby/cache-dir/commonjs. This works
    // around an error in the gatsby module where pages.json is not found.
    const destination = join(dirname(require.resolve("gatsby")), "pages.json");
    const source = join(dirname(dirname(destination)), "pages.json");
    execSync(`cp ${source} ${destination}`);

    return config;
};