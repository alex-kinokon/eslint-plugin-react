#!/usr/bin/env node
// @ts-check
const fs = require("fs")
const glob = require("fast-glob")
const { resolve } = require("path")
const { execSync } = require("child_process")

const outDir = "plugin"
fs.rmSync(outDir, { recursive: true, force: true })
fs.cpSync("./node_modules/eslint-plugin-react/", outDir, {
  recursive: true,
  dereference: true,
})

for (const path of glob.sync(`${outDir}/**/*.js`)) {
  const source = fs.readFileSync(path, "utf-8")
  const rewritten = source
    .replaceAll("require('object.fromentries')", "Object.fromEntries")
    .replaceAll("require('object.fromentries/polyfill')()", "Object.fromEntries")
    .replaceAll("require('object.entries')", "Object.entries")
    .replaceAll("require('object.values')", "Object.values")
    .replaceAll("require('array-includes')", "(arr, item) => arr.includes(item)")
    .replaceAll("require('object.hasown/polyfill')()", "Object.hasOwn")
    .replaceAll(
      "require('string.prototype.matchall')",
      "(str, regex) => str.matchAll(regex)"
    )
    .replaceAll(
      "require('array.prototype.flatmap')",
      "(arr, fn, thisArg) => arr.flatMap(fn, thisArg)"
    )
  fs.writeFileSync(path, rewritten)
}

const remove = [
  "array-includes",
  "array.prototype.flatmap",
  "object.entries",
  "object.fromentries",
  "object.values",
  "object.hasown",
  "string.prototype.matchall",
]

const pkgPath = resolve(outDir, "package.json")
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
pkg.name = `@proteria/${pkg.name}`
pkg.authors = ["proteria", pkg.author]
delete pkg.author
remove.forEach(name => {
  delete pkg.dependencies[name]
})
delete pkg.devDependencies
if (0) {
  const repo = execSync("git config --get remote.origin.url").toString().trim()
  pkg.repository.url = repo
  pkg.homepage = repo
}
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
