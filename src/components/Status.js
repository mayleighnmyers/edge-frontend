import React from 'react';
import PropTypes from 'prop-types';
import { Label, Tooltip, Split, SplitItem, Popover, Button, Alert } from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon'; 
import { statusMapper } from '../constants/status';

const Status = ({
  type,
  isLabel = false,
  hasPopover = false,
  toolTipContent = '',
  className = '',
  alertPopover = '', 
}) => {
  const { text, Icon, color, labelColor } =
    Object.prototype.hasOwnProperty.call(statusMapper, type)
      ? statusMapper[type]
      : statusMapper['default'];

  const [alertSeverityVariant, setAlertSeverityVariant] = React.useState('default');
    const alertIcons = {
        default: <BellIcon />,
        info: <InfoCircleIcon />,
        success: <CheckCircleIcon />,
        warning: <ExclamationTriangleIcon />,
        danger: <ExclamationCircleIcon />
      };

      return (
        <div>
          <div>
            <span style={{ paddingRight: '10px' }}>Alert variant:</span>
            <select aria-label="Popover alert type" onChange={event => setAlertSeverityVariant(event.target.value)}>
              <option value="Error">Error</option>
            </select>
          </div>
          <div style={{ margin: '50px' }}>
            <Popover
              aria-label="Alert popover"
              alertSeverityVariant={alertSeverityVariant = 'Error'}
              headerContent="Default popover title"
              headerIcon={alertIcons[alertSeverityVariant]}
              headerComponent="h1"
              bodyContent={<div>Popovers are triggered by click rather than hover.</div>}
              footerContent="Popover footer"
            >
              <Button>Toggle popover</Button>
            </Popover>
          </div>
        </div>
  );
};
<>
      { isLabel ? (
        <Label color={labelColor} icon={<Icon />} className={className}></Label>
        
  
      ) : hasPopover ? ( 
        <Popover
        aria-label="Basic popover"
        headerContent={<div>Error</div>
      }
        bodyContent={<div>The playbook failed to run.
          
        </div>}
        footerContent="Retry (button)"
      
      >


        <Button variant="link" isInline>{<Split style={{ color }} className={className}>
          <SplitItem className="pf-u-mr-sm">
            {toolTipContent ? (
              <Tooltip content="blargh">
                <Icon />
              </Tooltip>
            ) : (
              <Icon />
            )}
          </SplitItem>
          <SplitItem>
            <p>{text}</p>
          </SplitItem>
        </Split>}</Button>
      </Popover>
      ) : (
        <Split style={{ color }} className={className}>
          <SplitItem className="pf-u-mr-sm">
            {toolTipContent ? (
              <Tooltip content="blargh">
                <Icon />
              </Tooltip>
            ) : (
              <Icon />
            )}
          </SplitItem>
          <SplitItem>
            <p>{text}</p>
          </SplitItem>
        </Split>
      )}
    </>
 

export default Status;

Status.propTypes = {
  type: PropTypes.string,
  isLabel: PropTypes.bool,
  toolTipContent: PropTypes.string,
  className: PropTypes.string,
};
