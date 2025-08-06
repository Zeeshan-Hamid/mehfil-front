'use client';
import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './CreateInvoicePage.module.css';
import { useUserStore, useVendorStore } from '../state/userStore';
import { useRouter } from 'next/navigation';
import { useVendorAuth } from '../hooks/useVendorAuth';
import apiService from '../utils/api';

// Utility to generate a unique invoice number
function generateInvoiceNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0,10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `INVOICE-${datePart}-${randomPart}`;
}

export default function CreateInvoicePage() {
  // State for form fields
  const [client, setClient] = useState('');
  const [event, setEvent] = useState('');
  const [invoiceNumber] = useState(generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState('2023-06-23');
  const [dueDate, setDueDate] = useState('2023-06-23');
  const [paymentOption, setPaymentOption] = useState('Bank Transfer (ACH)');
  const [notes, setNotes] = useState('');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState(5);
  const [adjustments, setAdjustments] = useState([]); // now an array
  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const invoiceRef = useRef();
  
  // Refs for scrolling to error fields
  const clientInputRef = useRef();
  const itemsTableRef = useRef();

  const { user } = useUserStore();
  const { vendorData, addInvoice } = useVendorStore();
  const router = useRouter();
  
  // Use the efficient vendor auth hook
  const { isAuthorized, isChecking } = useVendorAuth();

  // Auto-clear errors when fields are filled
  useEffect(() => {
    clearErrors();
  }, [client, items]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Add/remove items
  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = idx => setItems(items.length > 1 ? items.filter((_, i) => i !== idx) : items);

  // Update item
  const updateItem = (idx, field, value) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // Add/remove/edit adjustments
  const addAdjustment = () => setAdjustments([...adjustments, 0]);
  const removeAdjustment = idx => setAdjustments(adjustments.filter((_, i) => i !== idx));
  const updateAdjustment = (idx, value) => setAdjustments(adjustments.map((adj, i) => i === idx ? value : adj));
  const adjustmentsTotal = adjustments.reduce((sum, a) => sum + Number(a || 0), 0);



  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const tax = taxEnabled ? subtotal * (Number(taxRate) / 100) : 0;
  const total = subtotal + tax + adjustmentsTotal;

  // Scroll to element with smooth animation
  const scrollToElement = (element) => {
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Add a subtle highlight effect
      element.style.transition = 'box-shadow 0.3s ease';
      element.style.boxShadow = '0 0 0 3px rgba(175, 142, 186, 0.3)';
      setTimeout(() => {
        element.style.boxShadow = '';
      }, 2000);
    }
  };

  // Validation
  const validate = () => {
    const errs = {};
    if (!client.trim()) errs.client = 'Client is required.';
    if (!items.length || !items.some(i => i.description.trim())) errs.items = 'At least one item with description is required.';
    return errs;
  };

  // Check if form is valid for button state
  const isFormValid = () => {
    return client.trim() && items.some(i => i.description.trim());
  };

  // Clear errors when fields are filled
  const clearErrors = () => {
    const newErrors = { ...errors };
    let hasChanges = false;
    
    // Clear client error if client is filled
    if (client.trim() && newErrors.client) {
      delete newErrors.client;
      hasChanges = true;
    }
    
    // Clear items error if at least one item has description
    if (items.some(i => i.description.trim()) && newErrors.items) {
      delete newErrors.items;
      hasChanges = true;
    }
    
    if (hasChanges) {
      setErrors(newErrors);
    }
  };

  // Generate PDF with validation
  const generatePDF = async () => {
    const errs = validate();
    setErrors(errs);
    
    if (Object.keys(errs).length > 0) {
      // Scroll to first error
      if (errs.client && clientInputRef.current) {
        scrollToElement(clientInputRef.current);
        return;
      }
      if (errs.items && itemsTableRef.current) {
        scrollToElement(itemsTableRef.current);
        return;
      }
      return;
    }
    
    if (!invoiceRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: invoiceRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 1. Add a new handler that combines PDF generation and invoice creation
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      if (errs.client && clientInputRef.current) {
        scrollToElement(clientInputRef.current);
        return;
      }
      if (errs.items && itemsTableRef.current) {
        scrollToElement(itemsTableRef.current);
        return;
      }
      return;
    }
    setIsGeneratingPDF(true);
    try {
      // Generate PDF first
      if (!invoiceRef.current) throw new Error('Invoice preview not ready');
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: invoiceRef.current.scrollHeight
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      // pdf.save(`invoice-${invoiceNumber}.pdf`); // Removed automatic download

      // Create invoice in backend
      const invoiceData = {
        clientName: client,
        event,
        invoiceNumber,
        invoiceDate,
        dueDate,
        paymentOption,
        notes,
        taxEnabled,
        taxRate,
        adjustments: [...adjustments],
        items: [...items],
        subtotal: subtotal,
        taxAmount: tax,
        adjustmentsTotal: adjustmentsTotal,
        total: total
      };

      const response = await apiService.createInvoice(invoiceData);
      
      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/profile_listing?tab=Invoices');
        }, 1200);
      } else {
        throw new Error(response.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error generating PDF or creating invoice:', error);
      alert('Failed to generate PDF or create invoice. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Don't render anything if not authorized or still checking
  if (isChecking || !isAuthorized) {
    return null;
  }

  return (
    <div className={styles['create-invoice-bg']}>
      {/* Back Button */}
      <div style={{ padding: '20px 0 0 20px' }}>
        <button 
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: '#AF8EBA',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          ← Back
        </button>
      </div>
      <div className={styles['invoice-header-row']}>
        <h1 className={styles['create-invoice-title']}>Create New Invoice</h1>
        <p className={styles['create-invoice-desc']}>Generate a new invoice for your client</p>
      </div>
      <form className={styles['invoice-main-card']} onSubmit={handleCreateInvoice} autoComplete="off">
        {/* Top Section: Two Columns */}
        <div className={styles['top-section-grid']}>
          {/* Left: Client Info */}
          <div className={styles['client-info-card']}>
            <div className={styles['section-title']}>Client Information</div>
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Client</label>
              <input 
                ref={clientInputRef}
                className={styles['form-input']} 
                placeholder="Enter Client Name" 
                value={client} 
                onChange={e => setClient(e.target.value)} 
              />
              {errors.client && <span style={{color:'#c00',fontSize:13}}>{errors.client}</span>}
            </div>
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Event</label>
              <input className={styles['form-input']} placeholder="Enter Event Name" value={event} onChange={e => setEvent(e.target.value)} />
            </div>
          </div>
          {/* Right: Invoice Details */}
          <div className={styles['invoice-details-card']}>
            <div className={styles['section-title']}>Invoice Details</div>
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Invoice Number</label>
              <input className={styles['form-input']} value={invoiceNumber} readOnly />
            </div>

                         <div className={styles['form-row']}>
               <div className={styles['form-group']} style={{flex: 1}}>
                 <label className={styles['form-label']}>Invoice Date</label>
                 <input className={styles['form-input']} type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
               </div>
               <div className={styles['form-group']} style={{flex: 1}}>
                 <label className={styles['form-label']}>Due Date</label>
                 <input className={styles['form-input']} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
               </div>
             </div>
           </div>
        </div>
        {/* Invoice Items Table (full width) */}
        <div className={styles['items-table-outer']} ref={itemsTableRef}>
          <div className={styles['section-title']} style={{marginBottom: 8}}>Invoice Items</div>
          <table className={styles['items-table']}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td><input className={styles['item-input']} placeholder="Enter Description..." value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} /></td>
                  <td>
                    <div className={styles['input-spin-group']}>
                      <input
                        className={styles['item-input']}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.quantity}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          updateItem(idx, 'quantity', Math.max(1, Number(val) || 1));
                        }}
                        style={{width: 40, textAlign: 'center'}}
                      />
                      <div className={styles['spin-btns']}>
                        <button type="button" className={styles['spin-btn']} onClick={() => updateItem(idx, 'quantity', Math.max(1, Number(item.quantity) + 1))}>▲</button>
                        <button type="button" className={styles['spin-btn']} onClick={() => updateItem(idx, 'quantity', Math.max(1, Number(item.quantity) - 1))}>▼</button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles['input-spin-group']}>
                      <input
                        className={styles['item-input']}
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        value={item.unitPrice}
                        onChange={e => {
                          let val = e.target.value.replace(/[^0-9.]/g, '');
                          if (val.split('.').length > 2) val = val.replace(/\.+$/, '');
                          updateItem(idx, 'unitPrice', Math.max(0, Number(val) || 0));
                        }}
                        style={{width: 60, textAlign: 'center'}}
                      />
                      <div className={styles['spin-btns']}>
                        <button type="button" className={styles['spin-btn']} onClick={() => updateItem(idx, 'unitPrice', Math.max(0, Number(item.unitPrice) + 1))}>▲</button>
                        <button type="button" className={styles['spin-btn']} onClick={() => updateItem(idx, 'unitPrice', Math.max(0, Number(item.unitPrice) - 1))}>▼</button>
                      </div>
                    </div>
                  </td>
                  <td>Rs. {(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</td>
                  <td>{items.length > 1 && <button type="button" onClick={() => removeItem(idx)} style={{color:'#AF8EBA',background:'none',border:'none',fontWeight:700,fontSize:18,cursor:'pointer'}}>&times;</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {errors.items && <span style={{color:'#c00',fontSize:13,marginTop:4,display:'block'}}>{errors.items}</span>}
        </div>
        {/* Totals Card: right-aligned under table */}
        <div className={styles['totals-card']} style={{marginLeft: 'auto'}}>
          <div className={styles['tax-row']}>
            <button
              type="button"
              className={styles['tax-switch']}
              aria-pressed={taxEnabled}
              onClick={() => setTaxEnabled(v => !v)}
              tabIndex={0}
            >
              <span className={taxEnabled ? styles['tax-switch-knob-on'] : styles['tax-switch-knob-off']} />
            </button>
            <span className={styles['tax-label']}>Apply Tax ?</span>
          </div>
          <div className={styles['tax-rate-row']}>
            <span className={styles['tax-rate-label']}>Tax Rate (%)</span>
            <input className={styles['tax-rate-input']} type="number" min="0" max="100" value={taxRate} onChange={e => setTaxRate(e.target.value)} disabled={!taxEnabled} />
          </div>
          <div className={styles['tax-adj-row']}>
            <span className={styles['tax-adj-label']}>Additional Adjustments</span>
            <button className={styles['tax-plus-btn']} type="button" onClick={addAdjustment}>+</button>
          </div>
          {adjustments.map((adj, idx) => (
            <div key={idx} className={styles['tax-adj-row']} style={{marginTop: 8}}>
              <input className={styles['tax-rate-input']} type="number" value={adj} onChange={e => updateAdjustment(idx, Number(e.target.value))} />
              <button className={styles['tax-plus-btn']} type="button" onClick={() => removeAdjustment(idx)} style={{borderColor:'#c00',color:'#c00'}}>&times;</button>
            </div>
          ))}
          <div className={styles['tax-divider']} />
          {/* Add Total Adjustments row before Subtotal */}
          <div className={styles['totals-breakdown']}>
            {/* Adjustments Row */}
            <div className={styles['totals-row']} style={{display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
              <span style={{flex:1, textAlign:'right', justifyContent:'flex-end', display:'flex'}} className={styles['totals-label-gray']}>Adjustments:</span>
              <span style={{minWidth:100, display:'flex', justifyContent:'flex-end', alignItems:'center', textAlign:'right'}} className={styles['totals-value-gray']}>
                <span style={{marginRight:2}}>$</span><span>{adjustmentsTotal.toFixed(2)}</span>
              </span>
            </div>
            {/* Subtotal Row */}
            <div className={styles['totals-row']} style={{display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
              <span style={{flex:1, textAlign:'right', justifyContent:'flex-end', display:'flex'}} className={styles['totals-label-gray']}>Subtotal:</span>
              <span style={{minWidth:100, display:'flex', justifyContent:'flex-end', alignItems:'center', textAlign:'right'}} className={styles['totals-value-gray']}>
                <span style={{marginRight:2}}>$</span><span>{subtotal.toFixed(2)}</span>
              </span>
            </div>
            {/* Tax Row */}
            <div className={styles['totals-row']} style={{display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
              <span style={{flex:1, textAlign:'right', justifyContent:'flex-end', display:'flex'}} className={styles['totals-label-gray']}>Tax:</span>
              <span style={{minWidth:100, display:'flex', justifyContent:'flex-end', alignItems:'center', textAlign:'right'}} className={styles['totals-value-gray']}>
                <span style={{marginRight:2}}>$</span><span>{tax.toFixed(2)}</span>
              </span>
            </div>
          </div>
          <div className={styles['tax-divider']} />
          {/* Total Row (bold, black) */}
          <div className={styles['totals-row']} style={{fontWeight: 700, display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
            <span style={{flex:1, textAlign:'right', justifyContent:'flex-end', display:'flex'}} className={styles['totals-label-black']}>Total:</span>
            <span style={{minWidth:100, display:'flex', justifyContent:'flex-end', alignItems:'center', textAlign:'right'}} className={styles['totals-value-black']}>
              <span style={{marginRight:2}}>$</span><span>{total.toFixed(2)}</span>
            </span>
          </div>
        </div>
        {/* Footer Card: Payment Options, Notes, Button */}
        <div className={styles['footer-card']}>
          <div className={styles['footer-label']}>Payment Options</div>
          <select className={styles['footer-input']} value={paymentOption} onChange={e => setPaymentOption(e.target.value)}>
            <option>Bank Transfer (ACH)</option>
            <option>Credit Card</option>
            <option>Cash</option>
          </select>
          <div className={styles['footer-label']} style={{marginTop: 18}}>Notes</div>
          <textarea className={styles['footer-textarea']} placeholder="Any additional notes or instructions" value={notes} onChange={e => setNotes(e.target.value)} />
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 18}}>
            <button 
              type="button" 
              className={styles['footer-btn']}
              onClick={handleCreateInvoice}
              disabled={!isFormValid() || isGeneratingPDF}
            >
              {isGeneratingPDF ? (<span style={{display:'flex',alignItems:'center',gap:8}}><span className="spinner" style={{width:16,height:16,border:'2px solid #fff',borderTop:'2px solid #AF8EBA',borderRadius:'50%',display:'inline-block',animation:'spin 1s linear infinite'}}></span> Creating...</span>) : '+ Create Invoice'}
            </button>
          </div>
        </div>
      </form>

      {/* Hidden invoice preview for PDF generation */}
      <div 
        ref={invoiceRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '800px',
          background: 'white',
          padding: '40px',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '14px',
          lineHeight: '1.4',
          color: '#23234A'
        }}
      >
        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#AF8EBA' }}>INVOICE</h1>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#616161' }}><strong>Invoice #:</strong> {invoiceNumber}</p>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#616161' }}><strong>Date:</strong> {invoiceDate}</p>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#616161' }}><strong>Due Date:</strong> {dueDate}</p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                         <div style={{ 
               width: '80px', 
               height: '80px', 
               borderRadius: '50%', 
               backgroundColor: '#AF8EBA', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               boxShadow: '0 2px 8px rgba(175, 142, 186, 0.3)'
             }}>
               <img src="/logo.png" alt="Mehfil" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
             </div>
          </div>
        </div>

        {/* Client Information */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>Bill To:</h3>
          <p style={{ margin: '4px 0', fontSize: '16px' }}><strong>{client}</strong></p>
          {event && <p style={{ margin: '4px 0', fontSize: '16px' }}><strong>Event:</strong> {event}</p>}
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E5E5' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: 'bold' }}>Description</th>
              <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '14px', fontWeight: 'bold' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', fontWeight: 'bold' }}>Unit Price</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', fontWeight: 'bold' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #E5E5E5' }}>
                <td style={{ padding: '12px 8px', fontSize: '14px' }}>{item.description}</td>
                <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '14px' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px' }}>${item.unitPrice.toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px' }}>${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ textAlign: 'right', marginBottom: '30px' }}>
          {adjustmentsTotal > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '14px' }}>Adjustments:</span>
              <span style={{ marginLeft: '20px', fontSize: '14px' }}>${adjustmentsTotal.toFixed(2)}</span>
            </div>
          )}
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '14px' }}>Subtotal:</span>
            <span style={{ marginLeft: '20px', fontSize: '14px' }}>${subtotal.toFixed(2)}</span>
          </div>
          {taxEnabled && tax > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '14px' }}>Tax ({taxRate}%):</span>
              <span style={{ marginLeft: '20px', fontSize: '14px' }}>${tax.toFixed(2)}</span>
            </div>
          )}
          <div style={{ borderTop: '2px solid #E5E5E5', paddingTop: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Total:</span>
            <span style={{ marginLeft: '20px', fontSize: '16px', fontWeight: 'bold' }}>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment and Notes */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Payment Method:</strong> {paymentOption}</p>
        </div>
        {notes && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>Notes:</h4>
            <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.5' }}>{notes}</p>
          </div>
        )}
      </div>

      {showSuccess && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:12,padding:40,minWidth:320,maxWidth:400,boxShadow:'0 4px 24px rgba(80,40,120,0.10)',textAlign:'center'}}>
            <h2 style={{color:'#AF8EBA',marginBottom:16}}>Invoice Created!</h2>
            <p style={{color:'#23234A',fontSize:16,marginBottom:24}}>Your invoice has been created successfully.</p>
            <button style={{background:'#AF8EBA',color:'#fff',border:'none',borderRadius:8,padding:'10px 32px',fontWeight:600,fontSize:15,cursor:'pointer'}} onClick={()=>setShowSuccess(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
} 