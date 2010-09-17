/**
 * @author Peter Nitsch
 */

const IAC = 255;
const GA = 249;
const WILL = 251;
const WONT = 252;
const DO = 253;
const DONT = 254;
const SB = 250;
const SE = 240;
const NOP = 241;
const DM = 242;
const BRK = 243;

const IP = 244;
const AO = 245;
const AYT = 246;
const EC = 247;
const EL = 248;

const ECHO = 1;
const SUPGA = 3;

const NAWS = 31;
const TTYPE = 24;
const IS = 0;
const SEND = 1;
const LOGOUT = 18;

const LINEMODE = 34;
const LM_MODE = 1;
const LM_EDIT = 1;
const LM_TRAPSIG = 2;
const LM_MODEACK = 4;
const LM_FORWARDMASK = 2;

const LM_SLC = 3;
const LM_SLC_NOSUPPORT = 0;
const LM_SLC_DEFAULT = 3;
const LM_SLC_VALUE = 2;
const LM_SLC_CANTCHANGE = 1;
const LM_SLC_LEVELBITS = 3;
const LM_SLC_ACK = 128;
const LM_SLC_FLUSHIN = 64;
const LM_SLC_FLUSHOUT = 32;

const LM_SLC_SYNCH = 1;
const LM_SLC_BRK = 2;
const LM_SLC_IP = 3;
const LM_SLC_AO = 4;
const LM_SLC_AYT = 5;
const LM_SLC_EOR = 6;
const LM_SLC_ABORT = 7;
const LM_SLC_EOF = 8;
const LM_SLC_SUSP = 9;

const NEWENV = 39;
const NE_INFO = 2;
const NE_VAR = 0;
const NE_VALUE = 1;
const NE_ESC = 2;
const NE_USERVAR = 3;

const NE_VAR_OK = 2;
const NE_VAR_DEFINED = 1;
const NE_VAR_DEFINED_EMPTY = 0;
const NE_VAR_UNDEFINED = -1;
const NE_IN_ERROR = -2;
const NE_IN_END = -3;
const NE_VAR_NAME_MAXLENGTH = 50;
const NE_VAR_VALUE_MAXLENGTH = 1000;

// Unused
const EXT_ASCII = 17;
const SEND_LOC = 23;
const AUTHENTICATION = 37;
const ENCRYPT = 38;