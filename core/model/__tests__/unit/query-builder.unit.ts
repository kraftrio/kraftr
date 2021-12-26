import { QueryBuilder } from '../../src/builder';

describe('QueryBuilder', function () {
  it('add a limit', function () {
    const query = new QueryBuilder();

    expect(query.limit(10).filter).toEqual([
      {
        limit: 10
      }
    ]);
  });

  it('add 2 filter if limit is called before than where', function () {
    const query = new QueryBuilder();

    expect(query.limit(10).where({ id: 'id' }).filter).toEqual([
      {
        limit: 10
      },
      {
        where: {
          id: 'id'
        }
      }
    ]);
  });

  it('add in the same filter if operations are called ordered', function () {
    const query = new QueryBuilder();

    expect(query.where({ id: 'id' }).limit(10).filter).toEqual([
      {
        where: {
          id: 'id'
        },
        limit: 10
      }
    ]);
  });

  it('merge where conditions', function () {
    const query = new QueryBuilder();

    expect(query.where({ id: 'id' }).where({ name: 'name' }).limit(10).filter).toEqual([
      {
        where: {
          id: 'id',
          name: 'name'
        },
        limit: 10
      }
    ]);
  });

  it('when where-limit-where is called create 2 separate filters', function () {
    const query = new QueryBuilder();

    expect(query.where({ id: 'id' }).limit(10).where({ name: 'name' }).filter).toEqual([
      {
        where: {
          id: 'id'
        },
        limit: 10
      },
      {
        where: {
          name: 'name'
        }
      }
    ]);
  });

  it('add a skip', function () {
    const query = new QueryBuilder();

    expect(query.skip(10).filter).toEqual([
      {
        skip: 10
      }
    ]);
  });

  it('add a where', function () {
    const query = new QueryBuilder();

    expect(query.where({ id: 'id' }).filter).toEqual([
      {
        where: {
          id: 'id'
        }
      }
    ]);
  });

  it('add a field', function () {
    const query = new QueryBuilder();

    expect(query.fields('+name').filter).toEqual([
      {
        fields: '+name'
      }
    ]);
  });

  it('works calling fields multiple times', function () {
    const query = new QueryBuilder();

    expect(query.fields('+name').fields('+house').filter).toEqual([
      {
        fields: ['+name', '+house']
      }
    ]);
  });

  it('add a sort', function () {
    const query = new QueryBuilder();

    expect(query.sort('+name').filter).toEqual([
      {
        sort: '+name'
      }
    ]);
  });

  it('add an include', function () {
    const query = new QueryBuilder();

    expect(query.include(['name']).filter).toEqual([
      {
        include: ['name']
      }
    ]);
  });
});
