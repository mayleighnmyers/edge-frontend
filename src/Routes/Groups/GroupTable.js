import React, { useState, Suspense } from 'react';
import PropTypes from 'prop-types';
import GeneralTable from '../../components/general-table/GeneralTable';
import { Link } from 'react-router-dom';
import { routes as paths } from '../../../package.json';
import { Bullseye, Spinner, Tooltip } from '@patternfly/react-core';
import { validateImage } from '../../api';

const UpdateDeviceModal = React.lazy(() =>
  import('../Devices/UpdateDeviceModal')
);

const filters = [
  {
    label: 'Name',
    type: 'text',
  },
  {
    label: 'Image',
    type: 'text',
  },
];

const columns = [
  { title: 'Name', type: 'name', sort: true },
  { title: 'Systems', type: 'name', sort: false },
  { title: 'Image', type: 'name', sort: false },
];

const GroupTable = ({
  data,
  count,
  isLoading,
  hasError,
  handleCreateModal,
  handleRenameModal,
  handleDeleteModal,
  fetchGroups,
}) => {
  const [updateModal, setUpdateModal] = useState({
    isOpen: false,
    deviceData: null,
    imageData: null,
  });

  const actionResolver = (rowData) => {
    if (!rowData?.rowInfo) return [];
    const { id, title, devices, devicesImageInfo } = rowData?.rowInfo;
    const hasValidImage =
      devices.length > 0 &&
      !validateImage(
        devices.map((device) => ({
          ID: device.ImageID,
        }))
      ).UpdateValid;

    const hasUpdate = devicesImageInfo?.some((image) => image.UpdateAvailable);

    return (
      id && [
        {
          title: 'Rename',
          onClick: () => handleRenameModal(id, title),
        },
        {
          title: 'Delete',
          onClick: () => handleDeleteModal(id, title),
        },
        {
          title: 'Update',
          onClick: () =>
            setUpdateModal((prevState) => ({
              ...prevState,
              deviceData: devices.map((device) => ({
                id: device.ID,
                display_name: device.Name,
              })),
              imageData: {
                Image: {
                  Name: devicesImageInfo[0].Name,
                  Version: devicesImageInfo[0].Version,
                  CreatedAt: devicesImageInfo[0].CreatedAt,
                  Distribution: devicesImageInfo[0].Distribution,
                  CommitID: devicesImageInfo[0].CommitID,
                },
                PackageDiff: devicesImageInfo[0].PackageDiff,
              },
              isOpen: true,
            })),
          isDisabled: devices.length > 0 ? !(hasValidImage && hasUpdate) : true,
        },
      ]
    );
  };

  const buildRows = data?.map((rowData) => {
    const { ID, Name, Devices } = rowData?.DeviceGroup;
    let { DevicesImageInfo } = rowData;
    if (!DevicesImageInfo) {
      DevicesImageInfo = [];
    }
    const systems = Devices ?? [];
    const image = (
      <div>
        <Tooltip
          content={
            <div>
              {DevicesImageInfo.map((device, index) => (
                <p key={index}>{device.Name}</p>
              ))}
            </div>
          }
        >
          <span>Multiple images</span>
        </Tooltip>
      </div>
    );

    return {
      rowInfo: {
        id: ID,
        title: Name,
        image:
          DevicesImageInfo.length === 0
            ? '-'
            : DevicesImageInfo.length > 1
            ? 'Multiple images'
            : DevicesImageInfo[0]?.Name,
        devicesImageInfo: rowData.DevicesImageInfo,
        devices: Devices,
      },
      noApiSortFilter: [
        Name,
        '',
        DevicesImageInfo.length === 0
          ? '-'
          : DevicesImageInfo.length > 1
          ? 'Multiple images'
          : DevicesImageInfo[0]?.Name,
      ],
      cells: [
        {
          title: <Link to={`${paths['fleet-management']}/${ID}`}>{Name}</Link>,
        },
        {
          title: systems.length,
        },
        {
          title:
            DevicesImageInfo.length === 0
              ? '-'
              : DevicesImageInfo.length > 1
              ? image
              : DevicesImageInfo[0]?.Name,
        },
      ],
    };
  });

  return (
    <>
      <GeneralTable
        apiFilterSort={false}
        filters={filters}
        tableData={{
          count,
          data,
          isLoading,
          hasError,
        }}
        columnNames={columns}
        rows={buildRows}
        actionResolver={actionResolver}
        areActionsDisabled={() => false}
        defaultSort={{ index: 0, direction: 'desc' }}
        emptyFilterState={{
          title: 'No matching groups found',
          body: 'To continue, edit your filter settings and try again',
        }}
        toolbarButtons={[
          {
            title: 'Create group',
            click: handleCreateModal,
          },
        ]}
      />
      {updateModal.isOpen && (
        <Suspense
          fallback={
            <Bullseye>
              <Spinner />
            </Bullseye>
          }
        >
          <UpdateDeviceModal
            navigateBack={() => {
              history.push({ pathname: history.location.pathname });
              setUpdateModal((prevState) => {
                return {
                  ...prevState,
                  isOpen: false,
                };
              });
            }}
            setUpdateModal={setUpdateModal}
            updateModal={updateModal}
            refreshTable={fetchGroups}
          />
        </Suspense>
      )}
    </>
  );
};

GroupTable.propTypes = {
  data: PropTypes.array,
  count: PropTypes.number,
  openModal: PropTypes.func,
  isLoading: PropTypes.bool,
  hasError: PropTypes.bool,
  handleRenameModal: PropTypes.func,
  handleDeleteModal: PropTypes.func,
  handleCreateModal: PropTypes.func,
  fetchGroups: PropTypes.func,
};

export default GroupTable;
