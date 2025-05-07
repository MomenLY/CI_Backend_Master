import { CaslAbilityFactory } from './casl-ability.factory';

describe('CaslAbilityFactory', () => {
  let caslAbilityFactory: CaslAbilityFactory;

  beforeEach(() => {
    caslAbilityFactory = new CaslAbilityFactory();
  });

  it('should grant correct permissions to user based on acl', () => {
    const user: any = {
      id: '1',
      acl: {
        article: {
          read: { permission: true },
          write: { permission: false },
        },
      },
    };

    const ability = caslAbilityFactory.createForUser(user);
    expect(ability.can('read', 'article')).toBe(true);
    expect(ability.can('write', 'article')).toBe(false);
  });
});
