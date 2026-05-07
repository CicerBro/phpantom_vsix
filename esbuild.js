const esbuild = require("esbuild");

const watch = process.argv.includes("--watch");

const buildOptions = {
    entryPoints: ["src/extension.ts"],
    bundle: true,
    external: ["vscode"],
    format: "cjs",
    platform: "node",
    sourcemap: true,
    target: "node18",
    outfile: "dist/extension.js"
};

async function main() {
    if (watch) {
        const context = await esbuild.context(buildOptions);
        await context.watch();
        console.log("Watching PHPantom VS Code extension...");
        return;
    }

    await esbuild.build(buildOptions);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
