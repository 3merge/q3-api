const refreshAwsLinks = require('../refreshAwsLinks');
const aws = require('../../config/aws');

jest.mock('../../config/aws', () => {
  const getPrivate = jest.fn();
  const mock = jest.fn().mockReturnValue({
    getPrivate,
  });

  mock.getPrivate = getPrivate;
  return mock;
});

beforeEach(() => {
  aws.getPrivate.mockClear();
});

describe('refreshAwsLinks', () => {
  it('should return self', () => {
    [null, undefined, '', 'Foo', 1, [], {}].forEach(
      (item) => {
        expect(refreshAwsLinks(item)).toEqual(item);
      },
    );
  });

  it('should replace with private link', () => {
    aws.getPrivate.mockImplementation((f) =>
      f.includes('food')
        ? 'https://cdn.photos/1.png'
        : 'https://cdn.photos/2.png',
    );

    const out = refreshAwsLinks(
      `<p>This is a photo
        <img src="https://private.s3.amazonaws.com/6107eb61033dff002338d28e26/Person%20looking%20at%20food%20in%20the%20fridge.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&amp;X-Amz-Credential=AKIAIFFGHKU2344432YAIA%2F20210802%2Fus-east-1%2Fs3%2Faws4_request&amp;X-Amz-Date=20210802T130133Z&amp;X-Amz-Expires=86400&amp;X-Amz-Signature=b71d599fcf05750110a523a2345454332e8fa4bf4b4a87592ff254281&amp;X-Amz-SignedHeaders=host" alt="From production site" />
        <img src="https://private.s3.amazonaws.com/61a644b75aedec002a546e68/blob?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIFFGHKUY4Q2LYAIA%2F20211203%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20211203T164354Z&X-Amz-Expires=86400&X-Amz-Signature=273898788b79e08f95dd60fd1278892fbd3c11bb23cf8b4e0dd3841ef1f1d1da&X-Amz-SignedHeaders=host" alt="From production site" />
      </p>`,
    );

    expect(aws.getPrivate).toHaveBeenCalledWith(
      '6107eb61033dff002338d28e26/Person looking at food in the fridge.jpg',
    );

    expect(out).toMatch(
      `<p>This is a photo
        <img src="https://cdn.photos/1.png" alt="From production site" />
        <img src="https://cdn.photos/2.png" alt="From production site" />
      </p>`,
    );
  });
});
