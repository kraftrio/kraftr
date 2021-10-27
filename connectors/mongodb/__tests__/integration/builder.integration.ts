import { MongoQueryBuilder } from '../../src/builder';
import { Filter } from '@kraftr/model';
import { tests } from '@kraftr/sequence';

describe('MongoBuilder', () => {
  it('works using all the transformers', async () => {
    const query: Filter = {
      sort: '+name',
      skip: 10,
      fields: ['+name'],
      limit: 10,
      where: { name: 'testName' }
    };
    const result = await tests.testSequence(MongoQueryBuilder, { aggregate: [], query });

    expect(result.returnValue.aggregate).toEqual([
      { $match: { name: 'testName' } },
      { $project: { name: true } },
      { $sort: { name: 1 } },
      {
        $facet: {
          data: [{ $skip: 10 }, { $limit: 10 }],
          pagination: [{ $count: '1' }]
        }
      },
      { $unwind: { path: '$pagination' } }
    ]);
  });

  it('works some of the transforms', async () => {
    const query: Filter = {
      sort: ['+name']
    };

    const result = await tests.testSequence(MongoQueryBuilder, { aggregate: [], query });

    expect(result.returnValue.aggregate).toEqual([
      { $sort: { name: 1 } },
      {
        $facet: {
          data: [{ $limit: 100 }],
          pagination: [{ $count: '1' }]
        }
      },
      { $unwind: { path: '$pagination' } }
    ]);
  });
});
