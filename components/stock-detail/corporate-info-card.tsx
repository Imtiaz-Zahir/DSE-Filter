import React from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  UserCheck,
  Calendar,
  DollarSign,
  Landmark,
  ExternalLink,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock } from "@/lib/types";
import { formatNumber, formatLargeNumber } from "@/lib/utils";

interface CorporateInfoCardProps {
  stock: Stock;
}

export function CorporateInfoCard({ stock }: CorporateInfoCardProps) {
  const contact = stock.addressContact;
  const opStatus = stock.operationalLoanStatus;
  const divSurplus = stock.dividendAndSurplus;
  const links = stock.financialLinks || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Col 1: Corporate Governance & Operational Info */}
      <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
        <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <Landmark className="size-4.5 text-primary" />
            <CardTitle className="text-base font-semibold">Corporate Disclosures & Debt Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-card border border-border/60 p-3">
              <span className="text-[11px] text-muted-foreground uppercase font-medium">
                Operational Status
              </span>
              <div className="mt-1 font-semibold text-foreground text-sm">
                {opStatus?.presentOperationalStatus || "Active"}
              </div>
            </div>

            <div className="rounded-xl bg-card border border-border/60 p-3">
              <span className="text-[11px] text-muted-foreground uppercase font-medium">
                Long-Term Loan / Debt
              </span>
              <div className="mt-1 font-semibold text-foreground text-sm">
                {opStatus?.longTermLoanMn !== null && opStatus?.longTermLoanMn !== undefined
                  ? `৳${formatNumber(opStatus.longTermLoanMn)} Mn`
                  : "0.00 Mn (Zero Debt)"}
              </div>
            </div>

            <div className="rounded-xl bg-card border border-border/60 p-3">
              <span className="text-[11px] text-muted-foreground uppercase font-medium">
                Last AGM Date
              </span>
              <div className="mt-1 font-semibold text-foreground text-sm">
                {stock.lastAGMHeldOn || "-"}
              </div>
            </div>

            <div className="rounded-xl bg-card border border-border/60 p-3">
              <span className="text-[11px] text-muted-foreground uppercase font-medium">
                Fiscal Year End
              </span>
              <div className="mt-1 font-semibold text-foreground text-sm">
                {divSurplus?.yearEnd || stock.forYearEnded || "-"}
              </div>
            </div>
          </div>

          {opStatus?.latestDividendStatus && (
            <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
              <span className="text-[11px] text-muted-foreground uppercase font-medium">
                Latest Dividend Announcement
              </span>
              <div className="mt-1 font-medium text-foreground">
                {opStatus.latestDividendStatus}
              </div>
            </div>
          )}

          {divSurplus?.reserveSurplusWithoutOciMn !== null && divSurplus?.reserveSurplusWithoutOciMn !== undefined && (
            <div className="flex justify-between items-center py-2 border-t border-border/40">
              <span className="text-muted-foreground">Reserve & Surplus (excl. OCI):</span>
              <span className="font-semibold text-foreground">
                {formatLargeNumber(divSurplus.reserveSurplusWithoutOciMn)}
              </span>
            </div>
          )}

          {/* Official investor links */}
          {links.length > 0 && (
            <div className="pt-2 border-t border-border/40 space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Investor Reports & Price Sensitive Information
              </span>
              <div className="space-y-1.5">
                {links.map((link, idx) => {
                  let label = "Investor Document / Disclosure";
                  if (link.toLowerCase().includes("financial-report") || link.toLowerCase().includes("annual-report")) {
                    label = "Annual / Financial Reports";
                  } else if (link.toLowerCase().includes("price-sensitive") || link.toLowerCase().includes("psi")) {
                    label = "Price Sensitive Information (PSI)";
                  } else if (link.toLowerCase().includes("quarterly") || link.toLowerCase().includes("interim")) {
                    label = "Interim & Quarterly Statements";
                  } else if (link.toLowerCase().includes("shareholding")) {
                    label = "Shareholding Reports";
                  }

                  return (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 text-primary hover:bg-primary/10 hover:border-primary/40 transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className="size-3.5 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <span className="font-medium text-xs block text-foreground group-hover:text-primary transition-colors">
                            {label}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate block">
                            {link}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Col 2: Company Contact & Headquarters */}
      <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
        <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <Building2 className="size-4.5 text-primary" />
            <CardTitle className="text-base font-semibold">Contact & Registered Office</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3.5 text-xs">
          {contact?.companySecretaryName && (
            <div className="flex items-start gap-2.5">
              <UserCheck className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground text-[11px] block">Company Secretary</span>
                <span className="font-semibold text-foreground">{contact.companySecretaryName}</span>
              </div>
            </div>
          )}

          {contact?.headOffice && (
            <div className="flex items-start gap-2.5">
              <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground text-[11px] block">Head / Corporate Office</span>
                <span className="font-medium text-foreground">{contact.headOffice}</span>
              </div>
            </div>
          )}

          {contact?.factory && contact.factory !== "N/A" && contact.factory !== "-" && (
            <div className="flex items-start gap-2.5">
              <Building2 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground text-[11px] block">Factory Location</span>
                <span className="font-medium text-foreground">{contact.factory}</span>
              </div>
            </div>
          )}

          {(contact?.phone || contact?.telephoneNo || contact?.cellNo) && (
            <div className="flex items-start gap-2.5">
              <Phone className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground text-[11px] block">Telephone / Phone</span>
                <span className="font-medium text-foreground">
                  {[contact.phone, contact.telephoneNo, contact.cellNo].filter(Boolean).join(", ")}
                </span>
              </div>
            </div>
          )}

          {contact?.email && (
            <div className="flex items-start gap-2.5">
              <Mail className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground text-[11px] block">Official Email</span>
                <a
                  href={`mailto:${contact.email}`}
                  className="font-medium text-primary hover:underline truncate"
                >
                  {contact.email}
                </a>
              </div>
            </div>
          )}

          {contact?.webAddress && (
            <div className="flex items-start gap-2.5">
              <Globe className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground text-[11px] block">Website</span>
                <a
                  href={contact.webAddress.startsWith("http") ? contact.webAddress : `http://${contact.webAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>{contact.webAddress}</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
