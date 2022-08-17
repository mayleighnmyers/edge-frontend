import React from 'react';
import GeneralTable from '../../components/general-table/GeneralTable';
import PropTypes from 'prop-types';
import { routes as paths } from '../../constants/routeMapper';
import { Link } from 'react-router-dom';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { cellWidth } from '@patternfly/react-table';
import { Tooltip } from '@patternfly/react-core';
import CustomEmptyState from '../../components/Empty';
import { useHistory } from 'react-router-dom';
import { emptyStateNoFliters } from '../../utils';
import DeviceStatus from '../../components/Status';

const getDeviceStatus = (deviceStatus, isUpdateAvailable) =>
  deviceStatus === 'UPDATING'
    ? 'updating'
    : isUpdateAvailable
    ? 'updateAvailable'
    : 'running';

const defaultFilters = [
  {
    label: 'Name',
    type: 'text',
  },
  {
    label: 'Status',
    type: 'checkbox',
    options: [
      // { option: 'Booting', value: 'booting' },
      // { option: 'Running', value: 'running' },
      { option: 'Update available', value: 'updateAvailable' },
      // { option: 'Updating', value: 'updating' },
    ],
  },
];

const columnNames = [
  {
    title: 'Name',
    type: 'name',
    sort: true,
    columnTransforms: [cellWidth(30)],
  },
  {
    title: 'Image',
    type: 'image',
    sort: false,
    columnTransforms: [cellWidth(20)],
  },
  {
    title: 'Groups',
    type: 'groups',
    sort: false,
    columnTransforms: [cellWidth(15)],
  },
  {
    title: 'Last seen',
    type: 'last_seen',
    sort: true,
    columnTransforms: [cellWidth(15)],
  },
  {
    title: 'Status',
    type: 'status',
    sort: false,
    columnTransforms: [cellWidth(25)],
  },
];

const createRows = (devices, hasLinks) => {
  return devices?.map((device) => {
    console.log(device)
    let { DeviceName, DeviceGroups } = device;

    const {
      DeviceID,
      DeviceUUID,
      UpdateAvailable,
      LastSeen,
      ImageName,
      ImageSetID,
      // ImageID,
      Status,
    } = device;

    if (DeviceName === '') {
      // needs to be fixed with proper name in sync with inv
      DeviceName = 'localhost';
    }

    if (DeviceGroups === null) {
      DeviceGroups = [];
    }

    const deviceGroupTooltip = (
      <div>
        <Tooltip
          content={
            <div>
              {DeviceGroups.map((group, index) => (
                <p key={index}>{group.Name}</p>
              ))}
            </div>
          }
        >
          <span>Multiple groups</span>
        </Tooltip>
      </div>
    );

    return {
      rowInfo: {
        deviceID: DeviceID,
        id: DeviceUUID,
        display_name: DeviceName,
        updateImageData: UpdateAvailable,
        deviceStatus: getDeviceStatus(Status, UpdateAvailable),
        imageSetId: ImageSetID,
        imageName: ImageName,
        deviceGroups: DeviceGroups,
      },
      noApiSortFilter: [
        DeviceName || '',
        ImageName || '',
        '',
        LastSeen || '',
        getDeviceStatus(Status, UpdateAvailable),
      ],
      cells: [
        {
          title: hasLinks ? (
            <Link to={`${paths['inventory']}/${DeviceUUID}`}>{DeviceName}</Link>
          ) : (
            DeviceName
          ),
        },
        {
          title: ImageName ? (
            hasLinks ? (
              <Link to={`${paths['manage-images']}/${ImageSetID}/`}>
                {ImageName}
              </Link>
            ) : (
              ImageName
            )
          ) : (
            'unavailable'
          ),
        },
        {
          title:
            DeviceGroups.length === 0
              ? '-'
              : DeviceGroups.length === 1
              ? DeviceGroups[0].Name
              : deviceGroupTooltip,
        },
        {
          title: LastSeen ? <DateFormat date={LastSeen} /> : 'Unknown',
        },
        {
          title: (
            <DeviceStatus hasPopover={true} type={getDeviceStatus(Status, UpdateAvailable)} />
          ),
        },
      ],
    };
  });
};

const DeviceTable = ({
  hasCheckbox = false,
  selectedItems,
  skeletonRowQuantity,
  data,
  count,
  isLoading,
  hasError,
  setUpdateModal,
  kebabItems,
  setRemoveModal,
  setIsAddModalOpen,
  handleAddDevicesToGroup,
  handleRemoveDevicesFromGroup,
  hasModalSubmitted,
  setHasModalSubmitted,
  fetchDevices,
  isSystemsView = false,
  isAddSystemsView = false,
}) => {
  const canBeRemoved = setRemoveModal;
  const canBeAdded = setIsAddModalOpen;
  const history = useHistory();

  const actionResolver = (rowData) => {
    const actions = [];
    if (isLoading) return actions;
    if (!rowData?.rowInfo?.id) return actions;

    if (handleAddDevicesToGroup) {
      actions.push({
        title: 'Add to group',
        onClick: () =>
          handleAddDevicesToGroup(
            [
              {
                ID: rowData.rowInfo.deviceID,
                name: rowData.rowInfo.display_name,
              },
            ],
            true
          ),
      });
    }

    if (handleRemoveDevicesFromGroup) {
      actions.push({
        title: 'Remove from group',
        isDisabled: rowData?.rowInfo?.deviceGroups.length === 0,
        onClick: () =>
          handleRemoveDevicesFromGroup(
            [
              {
                ID: rowData.rowInfo.deviceID,
                name: rowData.rowInfo.display_name,
                deviceGroups: rowData.rowInfo.deviceGroups,
              },
            ],
            true
          ),
      });
    }

    if (!areActionsDisabled(rowData)) {
      actions.push({
        title: 'Update',
        onClick: (_event, _rowId, rowData) => {
          setUpdateModal((prevState) => {
            return {
              ...prevState,
              isOpen: true,
              deviceData: [
                {
                  id: rowData.rowInfo.id,
                  display_name: rowData.rowInfo.display_name,
                },
              ],
              imageSetId: rowData.rowInfo.imageSetId,
            };
          });
        },
      });
    }

    if (canBeRemoved) {
      actions.push({
        title: 'Remove from group',
        onClick: () =>
          setRemoveModal({
            name: rowData.rowInfo.display_name,
            isOpen: true,
            deviceId: rowData.rowInfo.deviceID,
          }),
      });
    }

    return actions;
  };

  const areActionsDisabled = (rowData) =>
    rowData.rowInfo?.deviceStatus !== 'updateAvailable';

  return (
    <>
      {isSystemsView && emptyStateNoFliters(isLoading, count, history) ? (
        <CustomEmptyState
          data-testid="general-table-empty-state-no-data"
          icon={'plus'}
          title={'Connect edge systems'}
          body={
            'Connect and manage edge systems here after registering them via the console. To start, create a RHEL for Edge image and install it to your target system.'
          }
          secondaryActions={[
            {
              title:
                'Create RHEL for Edge images and configure automated management',
              link: 'https://access.redhat.com/documentation/en-us/edge_management/2022/html-single/create_rhel_for_edge_images_and_configure_automated_management/index',
              type: 'link',
            },
          ]}
        />
      ) : (
        <GeneralTable
          apiFilterSort={true}
          isUseApi={true}
          filters={defaultFilters}
          loadTableData={fetchDevices}
          tableData={{
            count: count,
            isLoading: isLoading,
            hasError: hasError,
          }}
          columnNames={columnNames}
          rows={createRows(data || [], isAddSystemsView || isSystemsView)}
          actionResolver={actionResolver}
          defaultSort={{ index: 3, direction: 'desc' }}
          toolbarButtons={
            canBeAdded
              ? [
                  {
                    title: 'Add systems',
                    click: () => setIsAddModalOpen(true),
                  },
                ]
              : []
          }
          hasCheckbox={hasCheckbox}
          skeletonRowQuantity={skeletonRowQuantity}
          selectedItems={selectedItems}
          kebabItems={kebabItems}
          hasModalSubmitted={hasModalSubmitted}
          setHasModalSubmitted={setHasModalSubmitted}
        />
      )}
    </>
  );
};
DeviceTable.propTypes = {
  imageData: PropTypes.object,
  urlParam: PropTypes.string,
  openUpdateWizard: PropTypes.func,
  skeletonRowQuantity: PropTypes.number,
  // possibly remove some of these
  temp: PropTypes.func,
  hasCheckbox: PropTypes.bool,
  setIsModalOpen: PropTypes.func,
  selectedItems: PropTypes.func,
  reload: PropTypes.bool,
  setReload: PropTypes.func,
  data: PropTypes.array,
  count: PropTypes.number,
  isLoading: PropTypes.bool,
  hasError: PropTypes.bool,
  setUpdateModal: PropTypes.func,
  handleSingleDeviceRemoval: PropTypes.func,
  kebabItems: PropTypes.array,
  setRemoveModal: PropTypes.func,
  setIsAddModalOpen: PropTypes.func,
  hasModalSubmitted: PropTypes.bool,
  setHasModalSubmitted: PropTypes.func,
  handleAddDevicesToGroup: PropTypes.func,
  handleRemoveDevicesFromGroup: PropTypes.func,
  fetchDevices: PropTypes.func,
  isSystemsView: PropTypes.bool,
  isAddSystemsView: PropTypes.bool,
};

export default DeviceTable;
