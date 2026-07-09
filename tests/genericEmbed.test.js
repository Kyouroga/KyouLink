import test from 'node:test';
import assert from 'node:assert/strict';

import buildGenericEmbed from '../src/embeds/genericEmbed.js';
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

test('buildGenericEmbed creates a title-only embed for branch create and delete events', () => {
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

    assert.ok(createdEmbed);
    assert.equal(createdEmbed.title, '[Kyouroga/KyouLink] New branch created: feature/test');
    assert.equal(createdEmbed.url, undefined);

    assert.ok(deletedEmbed);
    assert.equal(deletedEmbed.title, '[Kyouroga/KyouLink] branch deleted: feature/test');
    assert.equal(deletedEmbed.url, undefined);
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
