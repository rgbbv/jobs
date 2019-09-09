const request = require('request-promise-native');

module.exports = {
  getDockerContentDigest, getDockerContentTags
};

async function getDockerContentDigest(repo, tag) {
  const namespacedRepo = repo.includes('/') ? repo : `library/${repo}`;
  const tokenUrl = `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${namespacedRepo}:pull`;
  const { token } = await request({ url: tokenUrl, json: true });
  const digestUrl = `https://registry.hub.docker.com/v2/${namespacedRepo}/manifests/${tag}`;
  const response = await request({
    url: digestUrl,
    resolveWithFullResponse: true,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.docker.distribution.manifest.v2+json',
    },
  });
  return (
    response && response.headers && response.headers['docker-content-digest']
  );
}

async function getDockerContentTags(repo) {
  const namespacedRepo = repo.includes('/') ? repo : `library/${repo}`;
  const tokenUrl = `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${namespacedRepo}:pull`;
  const { token } = await request({ url: tokenUrl, json: true });
  const tagsUrl = `https://registry.hub.docker.com/v2/${namespacedRepo}/tags/list`;
  const response = await request({
    url: tagsUrl,
    resolveWithFullResponse: true,
    headers: {
      Authorization: 'Bearer ' + token
    },
  });
  content = JSON.parse(response.body)
  content.link = response.headers.link
  return (
    content
  );
}

async function getMoreDockerContentTags(link) {
  const response = await require({
    url: tagsUrl,
    resolveWithFullResponse: true,
  });
  content = JSON.parse(response.body)
  content.link = response.headers.link
  return (
    content
  );
}
