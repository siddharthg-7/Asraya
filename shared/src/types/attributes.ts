/**
 * @fileoverview Canonical Attribute Definitions and Data Types
 * Pramāṇa Protocol - Phase 1 Foundation
 */

export type AttributeDataType = 'string' | 'number' | 'boolean' | 'date';

export type AttributeCategory = 'civil' | 'financial' | 'transport' | 'educational' | 'custom';

export interface AttributeDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: AttributeCategory;
  readonly dataType: AttributeDataType;
  readonly description: string;
  readonly schemaId: string;
  readonly allowedValues?: readonly (string | number)[] | undefined;
  readonly unit?: string | undefined;
  readonly version?: string | undefined;
}

/**
 * Standard attribute identifiers defined by the Pramāṇa protocol
 */
export const CANONICAL_ATTRIBUTES = {
  // Civil / Identity
  AGE: 'urn:pramana:attr:civil:age',
  BIRTHDATE: 'urn:pramana:attr:civil:birthdate',
  DOMICILE_STATE: 'urn:pramana:attr:civil:domicile_state',
  DISTRICT: 'urn:pramana:attr:civil:district',
  CITIZENSHIP: 'urn:pramana:attr:civil:citizenship',

  // Financial
  ANNUAL_INCOME: 'urn:pramana:attr:fin:annual_income',
  TRAILING_12M_EARNINGS: 'urn:pramana:attr:fin:trailing_12m_earnings',
  ACCOUNT_BALANCE: 'urn:pramana:attr:fin:account_balance',
  CREDIT_SCORE: 'urn:pramana:attr:fin:credit_score',
  CURRENCY: 'urn:pramana:attr:fin:currency',

  // Transport & Permits
  LICENSE_CATEGORY: 'urn:pramana:attr:trans:license_category',
  LICENSE_VALIDITY: 'urn:pramana:attr:trans:validity_date',
  COMMERCIAL_PERMIT_STATUS: 'urn:pramana:attr:permit:status',
} as const;

export type CanonicalAttributeId = (typeof CANONICAL_ATTRIBUTES)[keyof typeof CANONICAL_ATTRIBUTES];

export const KNOWN_ATTRIBUTE_ALIASES = new Set<string>([
  'age',
  'birthdate',
  'domicile',
  'domicile_state',
  'district',
  'citizenship',
  'income',
  'annual_income',
  'annual_gross_income',
  'trailing_12m_earnings',
  'account_balance',
  'credit_score',
  'currency',
  'license_category',
  'license_validity',
  'permit_status',
  'commercial_permit_status',
  'category',
]);

export function isKnownCanonicalAttribute(id: string): boolean {
  if (typeof id !== 'string' || id.trim() === '') {
    return false;
  }
  const trimmed = id.trim();
  const canonicalValues = Object.values(CANONICAL_ATTRIBUTES) as string[];
  if (canonicalValues.includes(trimmed)) {
    return true;
  }
  if (trimmed.startsWith('urn:pramana:attr:') || trimmed.startsWith('urn:pramana:schema:')) {
    return true;
  }
  return KNOWN_ATTRIBUTE_ALIASES.has(trimmed.toLowerCase());
}
