import Image from 'next/image';
import PropTypes from 'prop-types';

const ICONS = {
  'Verified Vendor': '/verified_vendor_icon.png',
  'Top Rated Vendor': '/top_rated_vendor_icon.png',
  'Available on Time': '/available_on_time_icon.png',
  'Zabiha Halal Certified': '/halal_icon.png',
  // Add more system icons as needed
};

const TagLabel = ({ tag }) => {
  const iconSrc = ICONS[tag] || ''; // Only show icon if it exists in mapping
  const hasIcon = Boolean(iconSrc);
  
  return (
    <span
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.5rem 1.2rem',
        gap: hasIcon ? '0.7rem' : '0',
        background: '#AF8EBA',
        borderRadius: '1rem',
        fontFamily: 'Outfit, sans-serif',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '1.1rem',
        lineHeight: 1.2,
        color: '#FFFFFF',
        boxSizing: 'border-box',
        width: 'fit-content',
        minHeight: '2.2em',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
      }}
    >
      {hasIcon && (
        <Image src={iconSrc} alt={tag} width={22} height={22} style={{ minWidth: 22, minHeight: 22, width: '1.2em', height: '1.2em' }} />
      )}
      <span style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tag}</span>
    </span>
  );
};

TagLabel.propTypes = {
  tag: PropTypes.string.isRequired,
};

export default TagLabel; 