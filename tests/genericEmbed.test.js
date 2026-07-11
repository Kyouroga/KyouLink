import test from 'node:test';
import assert from 'node:assert/strict';

import buildGenericEmbed from '../src/embeds/genericEmbed.js';
import buildPushEmbed from '../src/embeds/pushEmbed.js';
import commitCommentHandler from '../src/handlers/commitComment.js';
import pushHandler from '../src/handlers/push.js';
import repositoryHandler from '../src/handlers/repository.js';
import * as COLORS from '../src/utils/colors.js';

test('buildGenericEmbed creates a realistic issue embed from a GitHub payload', () => {
    const payload = {
        action: 'opened',
        issue: {
            number: 7,
            html_url: 'https://github.com/Kyouroga/KyouLink/issues/7'
        },
        repository: {
            full_name: 'Kyouroga/KyouLink',
            html_url: 'https://github.com/Kyouroga/KyouLink'
        },
        sender: {
            login: 'octocat',
            html_url: 'https://github.com/octocat',
            avatar_url: 'https://github.com/octocat.png'
        }
    };

    const embed = buildGenericEmbed(payload, 'issues');

    assert.ok(embed);
    assert.equal(embed.title, 'octocat opened issue #7 in Kyouroga/KyouLink');
    assert.equal(embed.url, 'https://github.com/Kyouroga/KyouLink/issues/7');
    assert.equal(embed.color, COLORS.ISSUE_OPENED);
    assert.equal(embed.author.name, 'octocat');
    assert.equal(embed.author.url, 'https://github.com/octocat');
    assert.equal(embed.author.icon_url, 'https://github.com/octocat.png');
});

test('buildGenericEmbed handles repository rename events with a specific title', () => {
    const payload = {
        action: 'renamed',
        repository: {
            name: 'KyouLink',
            full_name: 'Kyouroga/KyouLink',
            html_url: 'https://github.com/Kyouroga/KyouLink'
        },
        changes: {
            repository: {
                name: {
                    from: 'OldName'
                }
            }
        },
        sender: {
            login: 'octocat',
            html_url: 'https://github.com/octocat',
            avatar_url: 'https://github.com/octocat.png'
        }
    };

    const embed = buildGenericEmbed(payload, 'repository');

    assert.ok(embed);
    assert.equal(embed.title, 'octocat renamed repository: OldName -> KyouLink');
    assert.equal(embed.url, undefined);
    assert.equal(embed.color, COLORS.PUSH);
});

test('buildGenericEmbed creates an embed for a starred repository event', () => {
    const payload = {
        action: 'started',
        repository: {
            full_name: 'Kyouroga/KyouLink',
            html_url: 'https://github.com/Kyouroga/KyouLink'
        },
        sender: {
            login: 'octocat',
            html_url: 'https://github.com/octocat',
            avatar_url: 'https://github.com/octocat.png'
        }
    };

    const embed = buildGenericEmbed(payload, 'watch');

    assert.ok(embed);
    assert.equal(embed.title, 'octocat starred repository Kyouroga/KyouLink');
    assert.equal(embed.color, COLORS.STAR);
    assert.equal(embed.author.name, 'octocat');
});

test('repositoryHandler uses the generic embed for star events', async () => {
    const payload = {
        action: 'started',
        repository: {
            full_name: 'Kyouroga/KyouLink',
            html_url: 'https://github.com/Kyouroga/KyouLink'
        },
        sender: {
            login: 'octocat',
            html_url: 'https://github.com/octocat',
            avatar_url: 'https://github.com/octocat.png'
        }
    };

    const embed = await repositoryHandler(payload, { NODE_ENV: 'test' });

    assert.ok(embed);
    assert.equal(embed.title, 'octocat starred repository Kyouroga/KyouLink');
    assert.equal(embed.color, COLORS.STAR);
});

test('buildPushEmbed uses the pusher as the author for normal push notifications', () => {
    const payload = {
        ref: 'refs/heads/main',
        repository: {
            full_name: 'Kyouroga/KyouLink',
            html_url: 'https://github.com/Kyouroga/KyouLink'
        },
        sender: {
            login: 'octocat',
            html_url: 'https://github.com/octocat',
            avatar_url: 'https://github.com/octocat.png'
        },
        head_commit: {
            author: {
                name: 'Ada Lovelace',
                username: 'ada'
            }
        },
        commits: [
            {
                id: 'abc1234',
                message: 'feat: ship a new widget',
                author: {
                    name: 'Ada Lovelace',
                    username: 'ada'
                }
            }
        ]
    };

    const embed = buildPushEmbed(payload);

    assert.ok(embed);
    assert.equal(embed.author.name, 'octocat');
    assert.equal(embed.title, '[Kyouroga/KyouLink:main] 1 new commit');
});

test('buildGenericEmbed no longer handles branch create and delete events', () => {
    const createdPayload = {
        ref: 'refs/heads/feature/test',
        ref_type: 'branch',
        created: true,
        repository: {
            full_name: 'Kyouroga/KyouLink',
            html_url: 'https://github.com/Kyouroga/KyouLink'
        },
        sender: {
            login: 'octocat',
            html_url: 'https://github.com/octocat',
            avatar_url: 'https://github.com/octocat.png'
        }
    };

    const deletedPayload = {
        ...createdPayload,
        created: false,
        deleted: true
    };

    const createdEmbed = buildGenericEmbed(createdPayload, 'push');
    const deletedEmbed = buildGenericEmbed(deletedPayload, 'push');
    const createEventEmbed = buildGenericEmbed(createdPayload, 'create');
    const deleteEventEmbed = buildGenericEmbed(deletedPayload, 'delete');

    assert.equal(createdEmbed, null);
    assert.equal(deletedEmbed, null);
    assert.equal(createEventEmbed, null);
    assert.equal(deleteEventEmbed, null);
});

test('commitCommentHandler emits a commit comment embed', async () => {
    const payload = {
        action: 'created',
        comment: {
            body: 'Looks good to me',
            html_url: 'https://github.com/Kyouroga/KyouLink/commit/abc1234#r1',
            commit_id: 'abc1234',
            user: {
                login: 'octocat',
                html_url: 'https://github.com/octocat',
                avatar_url: 'https://github.com/octocat.png'
            }
        },
        repository: {
            full_name: 'Kyouroga/KyouLink',
            html_url: 'https://github.com/Kyouroga/KyouLink'
        },
        sender: {
            login: 'octocat',
            html_url: 'https://github.com/octocat',
            avatar_url: 'https://github.com/octocat.png'
        }
    };

    const embed = await commitCommentHandler(payload, { NODE_ENV: 'test' });

    assert.ok(embed);
    assert.equal(embed.title, '[Kyouroga/KyouLink] Commit Comment on abc1234');
    assert.equal(embed.author.name, 'octocat');
});

test('commitCommentHandler skips empty commit comment bodies', async () => {
    const payload = {
        action: 'created',
        comment: {
            body: '   ',
            html_url: 'https://github.com/Kyouroga/KyouLink/commit/abc1234#r1',
            commit_id: 'abc1234',
            user: {
                login: 'octocat'
            }
        },
        repository: {
            full_name: 'Kyouroga/KyouLink'
        },
        sender: {
            login: 'octocat'
        }
    };

    const embed = await commitCommentHandler(payload, { NODE_ENV: 'test' });

    assert.equal(embed, null);
});

test('pushHandler uses the dedicated branch handler for branch create and delete events', async () => {
    const payload = {
        ref: 'refs/heads/feature/test',
        ref_type: 'branch',
        created: true,
        repository: {
            full_name: 'Kyouroga/KyouLink',
            html_url: 'https://github.com/Kyouroga/KyouLink'
        },
        sender: {
            login: 'octocat'
        }
    };

    const embed = await pushHandler(payload, { NODE_ENV: 'test' });

    assert.ok(embed);
    assert.equal(embed.title, '[Kyouroga/KyouLink] branch created: feature/test');
});

test('buildGenericEmbed returns null for ignored events', () => {
    const payload = {
        action: 'requested',
        repository: {
            full_name: 'Kyouroga/KyouLink'
        },
        sender: {
            login: 'octocat'
        }
    };

    const embed = buildGenericEmbed(payload, 'workflow_run');

    assert.equal(embed, null);
});
