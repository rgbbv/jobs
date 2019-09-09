#!/usr/bin/env node

const args = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const lib = require('../lib');
const _ = require('lodash');
const keypress = require('keypress');

module.exports = { validateDigestArgs, validateTagsArgs, getDigest, getTags };

const helpDigest = 'Usage: node cli/index.js --getDigest --repo=<repoName> --tag=<tagName>';
const helpTags = 'Usage: node cli/index.js --getTags --repo=<repoName> --search==<tagNameSubstring> (optional)';

if (args.help || args.h) {
  console.log(helpDigest);
  console.log(helpTags)
  process.exit(0);
}

async function getTags(repo, start) {
  try {
    const content = await lib.getDockerContentTags(repo);
    console.log(chalk.green(`Fetched tags for ${repo}:`));
    const parseTags = start ? content.tags.filter( tag => tag.includes(start)) : content.tags 
    parseTags.forEach((tag, index) => {
      console.log(`- ${tag}`)
    });
    return content.link;
  } catch (error) {
    if (error.statusCode === 401) {
      console.log(`Repo ${repo} does not exist on this Docker Hub registry account.`);
    } else {
      throw error;
    }
  }
}

async function getMoreTags(link) {
  try {
    const content = await lib.getMoreDockerContentTags(link);
    const parseTags = start ? content.tags.filter( tag => tag.includes(start)) : content.tags 
    parseTags.forEach((tag, index) => {
      console.log(`- ${tag}`)
    });
    return content.link;
  } catch (error) {
    if (error.statusCode === 401) {
      console.log(`Repo ${repo} does not exist on this Docker Hub registry account.`);
    } else {
      throw error;
    }
  }
}

function validateTagsArgs(args) {
  if (typeof args.repo === 'string') {
    return true;
  }
  console.log(chalk.red('Please provide repo name'));
  console.log(helpTags);
  return false;
}

async function getDigest(repo, tag) {
  try {
    const digest = await lib.getDockerContentDigest(repo, tag);
    console.log(chalk.green(`Fetched digest: ${digest} for ${repo}:${tag}`));
    return digest;
  } catch (error) {
    if (error.statusCode === 401) {
      console.log(`Repo ${repo} does not exist on this Docker Hub registry account.`);
    } else if (error.statusCode === 404) {
      console.log(`Repo ${repo} does not have the tag ${tag} available.`);
    } else {
      throw error;
    }
  }
}

function validateDigestArgs(args) {
  if (typeof args.repo === 'string' && [ 'string', 'number' ].includes(typeof args.tag)) {
    return true;
  }
  console.log(chalk.red('Please provide both repo name and tag'));
  console.log(helpDigest);
  return false;
}

async function init() {
  if (args.help || args.h) {
    console.log(helpDigest);
    console.log(helpTags)
    return 0;
  }
  if (args.getDigest) {
    if (!validateDigestArgs(args)) {
      return 1;
    }
    await getDigest(args.repo, args.tag);
  } else if (args.getTags) {
    if (!validateTagsArgs(args)) {
      return 1;
    }
    var link = await getTags(args.repo, args.start);
    while (link) {
      console.log(`
      for more press enter`)
      process.stdin.on('keypress', async function (ch, key) {
        if (key && key.name == 'enter') {
          process.stdin.pause();
          link = await getMoreTags(link)
        }
      });
      process.stdin.setRawMode(true);
      process.stdin.resume();
    }
  } else {
    console.log(helpDigest);
    console.log(helpTags);
  }
  return 0;
}

init()
  .catch(err => {
    console.log(chalk.red(err));
    process.exit(1);
  });
