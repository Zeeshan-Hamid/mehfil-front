import React, { useState, useRef, useEffect } from 'react';
import { useVendorStore } from '../../state/userStore';
import { useRouter } from 'next/navigation';
import styles from './InvoicesContent.module.css';
import apiService from '../../utils/api';

const INVOICES_PER_PAGE = 5;

export default function InvoicesContent() {
  const { vendorData } = useVendorStore();
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    pending: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 }
  });
  
  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await apiService.getInvoices({
          page: 1,
          limit: 100 // Get all invoices for now
        });
        
        if (response.success) {
          setInvoices(response.data.invoices);
          setSummary(response.data.summary);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(invoices.length / INVOICES_PER_PAGE);
  const [sortBy, setSortBy] = useState('Date');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Add debugging
  console.log('InvoicesContent - vendorData:', vendorData);
  console.log('InvoicesContent - invoices array:', invoices);
  console.log('InvoicesContent - invoices length:', invoices.length);

  // Sorting logic
  const sortOptions = [
    { label: 'Date', value: 'Date' },
    { label: 'Amount', value: 'Amount' },
    { label: 'Status', value: 'Status' },
    { label: 'Client', value: 'Client' },
    { label: 'Event', value: 'Event' },
  ];

  function sortInvoices(list) {
    const sortedList = [...list];
    
    switch (sortBy) {
      case 'Date':
        return sortedList.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'Amount':
        return sortedList.sort((a, b) => (b.amount || 0) - (a.amount || 0));
      case 'Status':
        const statusOrder = { 'Overdue': 0, 'Pending': 1, 'Paid': 2 };
        return sortedList.sort((a, b) => {
          const aOrder = statusOrder[a.status] ?? 99;
          const bOrder = statusOrder[b.status] ?? 99;
          return aOrder - bOrder;
        });
      case 'Client':
        return sortedList.sort((a, b) => 
          (a.clientName || '').localeCompare(b.clientName || '')
        );
      case 'Event':
        return sortedList.sort((a, b) => 
          (a.event || '').localeCompare(b.event || '')
        );
      default:
        return sortedList;
    }
  }

  // Handle click outside for dropdown
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInvoices = sortInvoices(filteredInvoices);
  const paginatedInvoices = sortedInvoices.slice((page - 1) * INVOICES_PER_PAGE, page * INVOICES_PER_PAGE);

  // Reset to first page when search term or sort changes
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, sortBy]);

  // Download invoice function
  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const blob = await apiService.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  // Update invoice status function
  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      let response;
      if (newStatus === 'Paid') {
        response = await apiService.markInvoiceAsPaid(invoiceId);
      } else {
        response = await apiService.updateInvoiceStatus(invoiceId, newStatus);
      }
      
      if (response.success) {
        // Refresh the invoices list
        const updatedResponse = await apiService.getInvoices({
          page: 1,
          limit: 100
        });
        
        if (updatedResponse.success) {
          setInvoices(updatedResponse.data.invoices);
          setSummary(updatedResponse.data.summary);
        }
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('Failed to update invoice status. Please try again.');
    }
  };

  // Delete invoice function
  const handleDeleteInvoice = async (invoiceId, invoiceNumber) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      return;
    }
    
    try {
      const response = await apiService.deleteInvoice(invoiceId);
      
      if (response.success) {
        // Refresh the invoices list
        const updatedResponse = await apiService.getInvoices({
          page: 1,
          limit: 100
        });
        
        if (updatedResponse.success) {
          setInvoices(updatedResponse.data.invoices);
          setSummary(updatedResponse.data.summary);
        }
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice. Please try again.');
    }
  };

  // Use summary from API
  const { totalAmount, pending, paid, overdue } = summary;

  if (loading) {
    return (
      <div className={styles.invoicesContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>⏳</div>
          <p>Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.invoicesContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>❌</div>
          <p>Error loading invoices: {error}</p>
        </div>
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <div className={styles.invoicesContainer}>
        {/* Summary Cards Row - Show even when no invoices */}
        <div className={styles.invoicesSummaryRow}>
          {/* Total Invoiced */}
          <div className={styles.invoiceSummaryCard}>
            <div className={`${styles.invoiceSummaryIcon} ${styles.total}`}>💵</div>
            <div className={styles.invoiceSummaryLabel}>Total Invoiced</div>
            <div className={`${styles.invoiceSummaryValue} ${styles.total}`}>$ 0</div>
            <div className={styles.invoiceSummaryDesc}>0 Invoices Total</div>
          </div>
          {/* Pending */}
          <div className={styles.invoiceSummaryCard}>
            <div className={`${styles.invoiceSummaryIcon} ${styles.pending}`}>🕒</div>
            <div className={styles.invoiceSummaryLabel}>Pending</div>
            <div className={`${styles.invoiceSummaryValue} ${styles.pending}`}>$ 0</div>
            <div className={styles.invoiceSummaryDesc}>0 Invoices Pending</div>
          </div>
          {/* Paid */}
          <div className={styles.invoiceSummaryCard}>
            <div className={`${styles.invoiceSummaryIcon} ${styles.paid}`}>✅</div>
            <div className={styles.invoiceSummaryLabel}>Paid</div>
            <div className={`${styles.invoiceSummaryValue} ${styles.paid}`}>$ 0</div>
            <div className={styles.invoiceSummaryDesc}>0 Invoices Paid</div>
          </div>
          {/* Overdue */}
          <div className={styles.invoiceSummaryCard}>
            <div className={`${styles.invoiceSummaryIcon} ${styles.overdue}`}>⏰</div>
            <div className={styles.invoiceSummaryLabel}>Overdue</div>
            <div className={`${styles.invoiceSummaryValue} ${styles.overdue}`}>$ 0</div>
            <div className={styles.invoiceSummaryDesc}>0 Invoices Overdue</div>
          </div>
        </div>

        {/* Invoice History Card */}
        <div className={styles.invoiceHistoryCard}>
          <div className={styles.invoiceHistoryHeaderRow}>
            <div className={styles.invoiceHistoryTitle}>Invoice History</div>
          </div>
          <div className={styles.invoiceHistoryActionsRow}>
            <div className={styles.invoiceHistorySearch}>
              <span className={styles.searchIcon}>🔍</span>
              <input 
                type="text" 
                placeholder="Search Invoices..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                disabled
              />
            </div>
            <div className={styles.invoiceHistoryActionsRight}>
              <button className={styles.createInvoiceBtn} onClick={() => router.push('/create_invoice')}>
                <span className={styles.plusIcon}>＋</span> Create Invoice
              </button>
            </div>
          </div>

          {/* Empty State */}
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🧾</div>
            <p>No invoices yet! Create your first invoice to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.invoicesContainer}>
      {/* Summary Cards Row */}
      <div className={styles.invoicesSummaryRow}>
        {/* Total Invoiced */}
        <div className={styles.invoiceSummaryCard}>
          <div className={`${styles.invoiceSummaryIcon} ${styles.total}`}>💵</div>
          <div className={styles.invoiceSummaryLabel}>Total Invoiced</div>
          <div className={`${styles.invoiceSummaryValue} ${styles.total}`}>$ {totalAmount.toLocaleString()}</div>
          <div className={styles.invoiceSummaryDesc}>{invoices.length} Invoices Total</div>
        </div>
        {/* Pending */}
        <div className={styles.invoiceSummaryCard}>
          <div className={`${styles.invoiceSummaryIcon} ${styles.pending}`}>🕒</div>
          <div className={styles.invoiceSummaryLabel}>Pending</div>
          <div className={`${styles.invoiceSummaryValue} ${styles.pending}`}>$ {pending.amount.toLocaleString()}</div>
          <div className={styles.invoiceSummaryDesc}>{pending.count} Invoices Pending</div>
        </div>
        {/* Paid */}
        <div className={styles.invoiceSummaryCard}>
          <div className={`${styles.invoiceSummaryIcon} ${styles.paid}`}>✅</div>
          <div className={styles.invoiceSummaryLabel}>Paid</div>
          <div className={`${styles.invoiceSummaryValue} ${styles.paid}`}>$ {paid.amount.toLocaleString()}</div>
          <div className={styles.invoiceSummaryDesc}>{paid.count} Invoices Paid</div>
        </div>
        {/* Overdue */}
        <div className={styles.invoiceSummaryCard}>
          <div className={`${styles.invoiceSummaryIcon} ${styles.overdue}`}>⏰</div>
          <div className={styles.invoiceSummaryLabel}>Overdue</div>
          <div className={`${styles.invoiceSummaryValue} ${styles.overdue}`}>$ {overdue.amount.toLocaleString()}</div>
          <div className={styles.invoiceSummaryDesc}>{overdue.count} Invoices Overdue</div>
        </div>
      </div>

      {/* Invoice History Card */}
      <div className={styles.invoiceHistoryCard}>
        <div className={styles.invoiceHistoryHeaderRow}>
          <div className={styles.invoiceHistoryTitle}>Invoice History</div>
        </div>
        <div className={styles.invoiceHistoryActionsRow}>
          <div className={styles.invoiceHistorySearch}>
            <span className={styles.searchIcon}>🔍</span>
            <input 
              type="text" 
              placeholder="Search Invoices..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.invoiceHistoryActionsRight}>
            <button className={styles.createInvoiceBtn} onClick={() => router.push('/create_invoice')}>
              <span className={styles.plusIcon}>＋</span> Create Invoice
            </button>
            <div className={styles.sortbyDropdownContainer} ref={dropdownRef}>
              <div
                className={styles.sortbyDropdownBtn}
                onClick={() => setDropdownOpen((open) => !open)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setDropdownOpen((open) => !open);
                  }
                }}
              >
                Sort By: <span className={styles.sortbySelected}>{sortBy}</span> <span className={styles.dropdownArrow}>▼</span>
              </div>
              {dropdownOpen && (
                <div className={styles.sortbyDropdownList}>
                  {sortOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className={`${styles.sortbyDropdownItem}${sortBy === opt.value ? ` ${styles.selected}` : ''}`}
                      onClick={() => { 
                        setSortBy(opt.value); 
                        setDropdownOpen(false); 
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSortBy(opt.value);
                          setDropdownOpen(false);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-selected={sortBy === opt.value}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className={styles.desktopView}>
          <div className={styles.invoiceTableHeaderRow}>
            <span>Invoice #</span>
            <span>Client</span>
            <span>Event</span>
            <span>Date</span>
            <span>Due Date</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {/* Invoice Rows */}
          {paginatedInvoices.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>🧾</div>
              <p>
                {searchTerm ? 'No invoices found matching your search.' : 'No invoices yet! Create your first invoice to get started.'}
              </p>
            </div>
          ) : (
            <>
              {paginatedInvoices.map((inv, idx) => (
                <div 
                  className={styles.invoiceTableRow} 
                  key={inv._id || idx}
                  onClick={() => handleDownloadInvoice(inv._id, inv.invoiceNumber)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>{inv.invoiceNumber || '-'}</span>
                  <span>{inv.clientName || '-'}</span>
                  <span>{inv.event || '-'}</span>
                  <span>{inv.formattedInvoiceDate || inv.invoiceDate?.split('T')[0] || '-'}</span>
                  <span>{inv.formattedDueDate || inv.dueDate?.split('T')[0] || '-'}</span>
                  <span>${inv.total?.toLocaleString() || '-'}</span>
                  <span>
                    <select 
                      value={inv.status || 'Pending'} 
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent row click when clicking dropdown
                        handleUpdateStatus(inv._id, e.target.value);
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click when clicking dropdown
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation(); // Prevent row click when clicking dropdown
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '12px',
                        backgroundColor: inv.status === 'Paid' ? '#e8f5e8' : 
                                       inv.status === 'Overdue' ? '#ffe8e8' : '#fff8e8'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Mobile Card View */}
        <div className={styles.mobileView}>
          {paginatedInvoices.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>🧾</div>
              <p>
                {searchTerm ? 'No invoices found matching your search.' : 'No invoices yet! Create your first invoice to get started.'}
              </p>
            </div>
          ) : (
            <div className={styles.mobileCards}>
              {paginatedInvoices.map((inv, idx) => (
                <div 
                  className={styles.mobileCard} 
                  key={inv._id || idx}
                  onClick={() => handleDownloadInvoice(inv._id, inv.invoiceNumber)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <h3>{inv.clientName || 'Unknown Client'}</h3>
                      <span className={styles.cardEventType}>{inv.event || 'No Event'}</span>
                    </div>
                    <div className={`${styles.cardStatus} ${styles[inv.status?.toLowerCase()]}`}>
                      {inv.status || 'Unknown'}
                    </div>
                  </div>
                  <div className={styles.cardDetails}>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Invoice #:</span>
                      <span className={styles.detailValue}>{inv.invoiceNumber || '-'}</span>
                    </div>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Date:</span>
                      <span className={styles.detailValue}>{inv.formattedInvoiceDate || inv.invoiceDate?.split('T')[0] || '-'}</span>
                    </div>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Due Date:</span>
                      <span className={styles.detailValue}>{inv.formattedDueDate || inv.dueDate?.split('T')[0] || '-'}</span>
                    </div>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Amount:</span>
                      <span className={styles.detailValue}>${inv.total?.toLocaleString() || '-'}</span>
                    </div>
                  </div>
                  <div className={styles.cardActions} style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <select 
                      value={inv.status || 'Pending'} 
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent card click when clicking dropdown
                        handleUpdateStatus(inv._id, e.target.value);
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when clicking dropdown
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation(); // Prevent card click when clicking dropdown
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '12px',
                        backgroundColor: inv.status === 'Paid' ? '#e8f5e8' : 
                                       inv.status === 'Overdue' ? '#ffe8e8' : '#fff8e8',
                        flex: '1',
                        minWidth: '100px'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <button 
              className={styles.paginationBtn} 
              onClick={() => setPage(page - 1)} 
              disabled={page === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button 
                key={i} 
                className={`${styles.paginationBtn}${page === i + 1 ? ` ${styles.active}` : ''}`} 
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className={styles.paginationBtn} 
              onClick={() => setPage(page + 1)} 
              disabled={page === totalPages}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 