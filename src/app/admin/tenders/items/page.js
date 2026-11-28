"use client";

import { useEffect, useState } from "react";
import { Dropdown, OverlayTrigger, Popover } from "react-bootstrap";
import { FiCheck, FiChevronDown, FiHome, FiLock, FiPackage, FiPlus, FiSlash } from "react-icons/fi";
import { FaGavel } from "react-icons/fa";
import { useCreateTenderItem, useSetTenderItemActivation, useTenderItems } from "@/api/tender/tenderItemApi";
import { useTenders } from "@/api/tender/tenderApi";
import { useTenants } from "@/api/tenant/tenantApi";
import AdminShell from "@/components/AdminShell";
import Loader from "@/components/Loader";
import PageCard from "@/components/PageCard";
import TenderItemFormDrawer from "@/components/TenderItemFormDrawer";
import Pagination from "@/components/Pagination";
import { useToast } from "@/components/ToastProvider";
import { getBreadcrumbs } from "@/const/navigation";

const PAGE_SIZE = 10;

// Closed dropdown showing a caption and the current choice.
function Picker({ icon: Icon, caption, label, options, selectedValue, onSelect, empty }) {
  return (
    <Dropdown onSelect={onSelect}>
      <Dropdown.Toggle as="button" type="button" className="mf-header-select" aria-label={caption}>
        <span className="mf-header-select-icon">
          <Icon size={15} />
        </span>
        <span className="mf-header-select-text">
          <span className="mf-header-select-caption">{caption}</span>
          <span className="mf-header-select-value">{label ?? empty}</span>
        </span>
        <FiChevronDown size={16} className="mf-header-select-chevron" />
      </Dropdown.Toggle>
      <Dropdown.Menu
        className="mf-select-menu mf-header-select-menu"
        popperConfig={{ strategy: "fixed" }}
        renderOnMount
      >
        <div className="mf-header-select-list">
          {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (
              <Dropdown.Item
                key={option.value}
                eventKey={option.value}
                active={isSelected}
                className="mf-select-option"
              >
                <span className="mf-header-select-name">{option.label}</span>
                {isSelected && <FiCheck size={16} />}
              </Dropdown.Item>
            );
          })}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default function TenderItemsPage() {
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [tenderId, setTenderId] = useState(null);
  const [items, setItems] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const toast = useToast();
  const { call: fetchTenants } = useTenants();
  const { call: fetchTenders } = useTenders();
  const { call: fetchItems, loading } = useTenderItems();
  const { call: addItem, loading: creating } = useCreateTenderItem();
  const { call: saveActivation, loading: activationSaving } = useSetTenderItemActivation();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    fetchTenants({ activeOnly: true })
      .then((list) => setTenants(Array.isArray(list) ? list : []))
      .catch((err) => toast.error(err.message, { title: "Couldn't load tenants" }));
  }, [fetchTenants, toast]);

  const tenantOptions = tenants
    .map((tenant) => ({ value: tenant.id, label: tenant.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const selectedTenant = tenantOptions.find((o) => o.value === tenantId) ?? tenantOptions[0];
  const selectedTenantId = selectedTenant?.value;

  // Tenders of the chosen tenant (up to the backend's max page of 500).
  useEffect(() => {
    if (!selectedTenantId) return;
    fetchTenders({ tenantId: selectedTenantId, limit: 499, activeOnly: false })
      .then(({ items: list }) => setTenders(list))
      .catch((err) => toast.error(err.message, { title: "Couldn't load tenders" }));
  }, [fetchTenders, toast, selectedTenantId]);

  const tenderOptions = tenders.map((tender) => ({
    value: tender.id,
    label: `${tender.reference_no} — ${tender.title}`,
  }));
  const selectedTender = tenderOptions.find((o) => o.value === tenderId) ?? tenderOptions[0];
  const selectedTenderId = selectedTender?.value;
  // The backend only accepts new items while the tender is a draft (status 4001); inactive tenders are locked here too.
  const selectedTenderData = tenders.find((t) => t.id === selectedTenderId);
  const canAddItem = selectedTenderData?.status_code === 4001 && selectedTenderData?.is_active;
  const addDisabledReason = !selectedTenderData
    ? { icon: FiPackage, tone: "info", title: "No tender selected", text: "Pick a tender above to add items to it." }
    : !selectedTenderData.is_active
      ? { icon: FiSlash, tone: "warn", title: "Tender is inactive", text: "Activate this tender on the All Tenders page to add items." }
      : selectedTenderData.status_code !== 4001
        ? {
            icon: FiLock,
            tone: "warn",
            title: `Tender is ${selectedTenderData.status?.display_name ?? "not a draft"}`,
            text: "Items can only be added while a tender is in Draft. Change its status to Draft first.",
          }
        : undefined;

  const handleActivationChange = async (item, isActive) => {
    try {
      const updated = await saveActivation(selectedTenderId, item.id, isActive);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      toast.success(`${updated.name} is now ${isActive ? "active" : "inactive"}.`, {
        title: "Item updated",
      });
    } catch (err) {
      toast.error(err.message, { title: "Couldn't update item" });
    }
  };

  const handleSaveItem = async (values) => {
    try {
      const created = await addItem(selectedTenderId, values);
      setPage(1);
      setReloadKey((key) => key + 1);
      toast.success(`${created.name} was added.`, { title: "Item added" });
      return true;
    } catch (err) {
      toast.error(err.message, { title: "Couldn't add item" });
      return false;
    }
  };

  useEffect(() => {
    if (!selectedTenderId) return;
    fetchItems(selectedTenderId, {
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      activeOnly: false,
    })
      .then(({ items: list, hasNext: more }) => {
        setItems(list);
        setHasNext(more);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err.message);
        toast.error(err.message, { title: "Couldn't load items" });
      });
  }, [fetchItems, toast, selectedTenderId, page, reloadKey]);

  const handleTenantChange = (value) => {
    setTenantId(value);
    setTenders([]);
    setItems([]);
    setHasNext(false);
    setTenderId(null);
    setPage(1);
  };

  const handleTenderChange = (value) => {
    setTenderId(value);
    setPage(1);
  };

  return (
    <AdminShell title="Items" breadcrumbs={getBreadcrumbs("tenders", "tender-items")}>
      <Loader show={loading || creating || activationSaving} />
      <TenderItemFormDrawer
        show={formOpen}
        tenderLabel={selectedTender?.label}
        saving={creating}
        onHide={() => setFormOpen(false)}
        onSave={handleSaveItem}
      />
      <PageCard
        scrollResetKey={page}
        footer={
          items.length > 0 && (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              count={items.length}
              hasNext={hasNext}
              onPageChange={setPage}
            />
          )
        }
        leading={
          <div className="mf-roles-filters">
            <Picker
              icon={FiHome}
              caption="Tenant"
              label={selectedTenant?.label}
              empty="Select tenant"
              options={tenantOptions}
              selectedValue={selectedTenantId}
              onSelect={handleTenantChange}
            />
            <Picker
              icon={FaGavel}
              caption="Tender"
              label={selectedTender?.label}
              empty="No tenders"
              options={tenderOptions}
              selectedValue={selectedTenderId}
              onSelect={handleTenderChange}
            />
          </div>
        }
        actions={
          // A disabled button doesn't get hover events, so the popover hangs off a wrapper.
          <OverlayTrigger
            placement="bottom"
            trigger={canAddItem ? [] : ["hover", "focus"]}
            popperConfig={{ strategy: "fixed" }}
            overlay={
              <Popover id="add-item-disabled" className="mf-hint-popover">
                {addDisabledReason && (
                  <Popover.Body>
                    <span className={`mf-hint-popover-icon is-${addDisabledReason.tone}`}>
                      <addDisabledReason.icon size={16} />
                    </span>
                    <div>
                      <div className="mf-hint-popover-title">{addDisabledReason.title}</div>
                      <div className="mf-hint-popover-text">{addDisabledReason.text}</div>
                    </div>
                  </Popover.Body>
                )}
              </Popover>
            }
          >
            <span className="d-inline-block" tabIndex={canAddItem ? undefined : 0}>
              <button
                type="button"
                className="mf-page-card-btn mf-page-card-btn--add"
                disabled={!canAddItem}
                style={canAddItem ? undefined : { pointerEvents: "none" }}
                onClick={() => setFormOpen(true)}
              >
                <FiPlus size={16} />
                Add Item
              </button>
            </span>
          </OverlayTrigger>
        }
      >
        {items.length > 0 ? (
          <table className="mf-mc-table">
            <thead>
              <tr>
                <th>Item No</th>
                <th>Name</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={item.is_active ? undefined : "mf-tender-row--inactive"}>
                  <td className="mf-mc-muted">{item.item_no}</td>
                  <td>
                    <div className="mf-tender-title">{item.name}</div>
                    {item.description && <div className="mf-tender-desc">{item.description}</div>}
                  </td>
                  <td>{item.item_type?.display_name ?? item.item_type?.value ?? "—"}</td>
                  <td>{Number(item.quantity).toLocaleString("en-IN", { maximumFractionDigits: 3 })}</td>
                  <td>{item.unit}</td>
                  <td>
                    <label
                      className={`mf-switch${item.is_active ? " is-on" : ""}`}
                      title={canAddItem ? "Set item active or inactive" : addDisabledReason?.title}
                    >
                      <input
                        type="checkbox"
                        role="switch"
                        className="mf-switch-input"
                        checked={Boolean(item.is_active)}
                        disabled={activationSaving || !canAddItem}
                        onChange={(event) => handleActivationChange(item, event.target.checked)}
                        aria-label={`${item.name} active`}
                      />
                      <span className="mf-switch-track" aria-hidden="true">
                        <span className="mf-switch-thumb">
                          <FiCheck size={10} strokeWidth={3.5} />
                        </span>
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : loadError ? (
          <div className="mf-page-card-empty">
            <span className="mf-page-card-empty-icon">
              <FiPackage size={22} />
            </span>
            <h3>Couldn&apos;t load items</h3>
            <p>{loadError}</p>
            <button
              type="button"
              className="mf-page-card-btn mf-page-card-btn--add"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        ) : loading ? null : (
          <div className="mf-page-card-empty">
            <span className="mf-page-card-empty-icon">
              <FiPackage size={22} />
            </span>
            <h3>No items yet</h3>
            <p>{selectedTender ? "This tender has no items." : "Select a tender to see its items."}</p>
          </div>
        )}
      </PageCard>
    </AdminShell>
  );
}
