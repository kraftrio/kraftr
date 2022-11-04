import { BindingAddress } from '@kraftr/context';
import { Test } from '@kraftr/common';
import { Filter, FilterSingle, Include } from '../../src';
import { ModelReference } from '../../src/model';

const { checks, check } = Test;
type AddressModel = {
  name: 'Address';
  kind: 'single-model';
  properties: {
    name: {
      kind: 'field';
      type: [string];
      metadata: {
        hideable: true;
      };
    };
  };
};
type CarModel = {
  name: 'Car';
  kind: 'single-model';
  properties: {
    name: {
      kind: 'field';
      type: [string];
      metadata: {
        hideable: true;
      };
    };
  };
};
type UserModel = {
  name: 'User';
  kind: 'single-model';
  properties: {
    name: {
      kind: 'field';
      type: [string];
      metadata: {
        hideable: true;
      };
    };
    address: {
      kind: 'field';
      type: [ModelReference<AddressModel>];
      metadata: {
        sortable: false;
        relation: {
          key: string;
          model: BindingAddress<AddressModel>;
        };
      };
    };
    cars: {
      kind: 'field';
      type: [ModelReference<CarModel>];
      metadata: {
        multiple: true;
        sortable: false;
        relation: {
          key: string;
          model: BindingAddress<CarModel>;
        };
      };
    };
  };
};

type Expected =
  | {
      address: FilterSingle<AddressModel>;
      cars: Filter<CarModel>;
    }
  | 'all'
  | ('address' | 'cars')[];

type Result = Include<UserModel>;

checks([check<Result, Expected, Test.Pass>()]);
