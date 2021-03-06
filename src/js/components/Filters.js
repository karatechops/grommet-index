// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import Menu from 'grommet/components/Menu';
import Box from 'grommet/components/Box';
import Sidebar from 'grommet/components/Sidebar';
import FilterIcon from 'grommet/components/icons/base/Filter';
import Header from 'grommet/components/Header';
import Button from 'grommet/components/Button';
import Filter from './Filter';
import Sort from './Sort';
import Intl from 'grommet/utils/Intl';

const CLASS_ROOT = 'index-filters';

export default class Filters extends Component {

  constructor (props) {
    super(props);

    this._onChange = this._onChange.bind(this);
    this._onChangeSort = this._onChangeSort.bind(this);
  }

  _onChange (name, filterValues) {
    let values = { ...this.props.values };
    values[name] = filterValues;
    this.props.onChange(values);
  }

  _onChangeSort (value) {
    this.props.onSort(value);
  }

  _renderFilter (attribute) {
    const { filter } = attribute;
    return (
      <Filter key={attribute.name} all={filter.all} inline={true}
        label={attribute.label} name={attribute.name}
        status={attribute.status} choices={filter.values}
        values={this.props.values[attribute.name]}
        onChange={values => {
          this._onChange(attribute.name, values);
        }} />
    );
  }

  _renderCounts () {
    const { data } = this.props;

    const countClasses = classnames(`${CLASS_ROOT}__count`, {
      [`${CLASS_ROOT}__count--active`]: data.unfilteredTotal > data.total
    });

    return (
      <div>
        <span className={`${CLASS_ROOT}__total`}>
          {data.unfilteredTotal}
        </span>
        <span className={countClasses}>
          {data.total}
        </span>
      </div>
    );
  }

  _renderSort () {
    const { attributes, sort } = this.props;
    // prune to just attributes that we should sort
    const sortAttributes = attributes.filter(attribute => attribute.sort);
    let result;
    if (sortAttributes.length > 0) {
      result = (
        <Sort attributes={sortAttributes} value={sort}
          onChange={this._onChangeSort} />
      );
    }
    return result;
  }

  _renderIcon() {
    const { values } = this.props;
    const hasSelectedFilters = Object.keys(values).reduce((acc, key) => {
      return values[key].length > 0;
    }, false);

    return (
      <FilterIcon colorIndex={hasSelectedFilters ? 'brand' : undefined} />
    );
  }

  _renderMenu ({ filters, sort, classNames }) {
    const { data, direction } = this.props;
    const a11yTitle = Intl.getMessage(this.context.intl, 'Filter');
    const icon = this._renderIcon();

    return (
      <div className={`${CLASS_ROOT}__filters no-flex`}>
        <Menu className={CLASS_ROOT + "__menu"} icon={icon}
          dropAlign={{right: 'right'}} a11yTitle={a11yTitle}
          direction="column" closeOnClick={false}>
          <Box direction={direction}
            pad={{horizontal: 'large', vertical: 'medium', between: 'medium'}}
            className={classNames.join(' ')}>
            {filters}
            {sort}
          </Box>
        </Menu>
        {data && this._renderCounts()}
      </div>
    );
  }

  _renderSidebar ({ filters, sort, classNames }) {
    const { direction } = this.props;
    const icon = this._renderIcon();

    return (
      <Sidebar colorIndex="light-2">
        <Header size="large" pad={{horizontal: 'medium'}} justify="between">
          {Intl.getMessage(this.context.intl, 'Filter by')}
          <div className={`${CLASS_ROOT}__filters no-flex`}>
            <Button icon={icon} plain={true} onClick={this.props.onClose}/>
            {this._renderCounts()}
            </div>
        </Header>
        <Box
          direction={direction}
          pad={{horizontal: 'large', vertical: 'medium', between: 'medium'}}
          className={classNames.join(' ')}>
          {filters}
          {sort}
        </Box>
      </Sidebar>
    );
  }

  render () {
    const { attributes, inline } = this.props;
    let classNames = [CLASS_ROOT];
    if (inline) {
      classNames.push(`${CLASS_ROOT}--inline`);
    }
    if (this.props.className) {
      classNames.push(this.props.className);
    }

    const filterOrSortAttributes = attributes.filter(a => a.filter || a.sort);

    const filters = attributes
      .filter(attribute => attribute.hasOwnProperty('filter'))
      .map(attribute => this._renderFilter(attribute));

    let sort;
    if (this.props.sort) {
      sort = this._renderSort();
    }

    let result;
    if (filterOrSortAttributes.length > 0) {
      if (inline) {
        result = this._renderSidebar({filters, sort, classNames});
      } else {
        result = this._renderMenu({filters, sort, classNames});
      }
    }

    return result;
  }

}

Filters.propTypes = {
  attributes: PropTypes.arrayOf(PropTypes.shape({
    filter: PropTypes.shape({
      all: PropTypes.bool,
      values: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string.isRequired
      })).isRequired
    }),
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    sort: PropTypes.shape({
      direction: PropTypes.string, // asc|desc
      sections: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.any
      }))
    }),
    status: PropTypes.bool
  })).isRequired,
  direction: PropTypes.oneOf(['row', 'column']),
  inline: PropTypes.bool,
  onChange: PropTypes.func, // (values)
  onSort: PropTypes.func, // (sort)
  sort: PropTypes.string, // name:asc|desc
  values: PropTypes.object // name: [value, ...]
};

Filters.defaultProps = {
  direction: "column",
  values: {}
};

Filters.contextTypes = {
  intl: PropTypes.object
};
