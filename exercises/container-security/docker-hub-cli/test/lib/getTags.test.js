const { validateTagsArgs, getTags } = require('../../cli/index');
const { getDockerContentTags } = require('../../lib/index.js');

describe('test validateTagsArgs', () => {
  test('validate valid args', () => {
    const args = { repo: 'alpine' };
    expect(validateTagsArgs(args)).toBeTruthy();
  });
  test('validate wrong type arg', () => {
    const args = { repo: 1 };
    expect(validateTagsArgs(args)).toBeFalsy();
  });
});

jest.mock('../../lib/index.js', () => ({
  getDockerContentTags: jest.fn()
}))

describe('test getTags', () => {
    test('valid repo and tag', async () => {
    getDockerContentTags.mockReturnValueOnce('{"tags": [ "test" ] }');
    const args = { repo: 'alpine' };
    expect(await getTags(args.repo, args.tag)).toEqual(["test"]);
  });
  test('handles unknown error', async () => {
    getDockerContentTags.mockRejectedValue(new Error());
    const args = { repo: 'alpine' };
    await expect(getTags(args.repo, args.tag)).rejects.toThrow();
  });
  test('handles not found Error for non existent', async () => {
    const notFoundError = { statusCode: 401 };
    getDockerContentTags.mockRejectedValue(notFoundError);
    const args = { repo: 'nonExistentRepo' };
    await !expect(getTags(args.repo, args.tag)).rejects.toThrow();
  });
});



