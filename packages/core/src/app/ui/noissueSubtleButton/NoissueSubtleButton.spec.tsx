import { shallow } from 'enzyme';
import React from 'react';

import Button from './NoissueSubtleButton';

describe('Button', () => {
    it('matches snapshot', () => {
        expect(shallow(<Button>Hello world</Button>)).toMatchSnapshot();
    });

    it('renders button with label', () => {
        expect(shallow(<Button>Hello world</Button>).text()).toBe('Hello world');
    });

    it('renders button in full width', () => {
        expect(shallow(<Button isFullWidth>Hello world</Button>).hasClass('subtle-button--slab')).toBe(
            true,
        );

        expect(shallow(<Button>Hello world</Button>).hasClass('subtle-button--slab')).toBe(false);
    });

    it('shows loading indicator', () => {
        expect(shallow(<Button isLoading>Hello world</Button>).hasClass('is-loading')).toBe(true);

        expect(shallow(<Button>Hello world</Button>).hasClass('is-loading')).toBe(false);
    });

    it('listens to DOM events', () => {
        const handleClick = jest.fn();
        const component = shallow(<Button onClick={handleClick}>Hello world</Button>);

        component.simulate('click');

        expect(handleClick).toHaveBeenCalled();
    });
});
